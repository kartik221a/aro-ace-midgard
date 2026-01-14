
import { db } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

export type LikeType = "friend" | "relationship";

export interface LikeData {
    fromUserId: string;
    toUserId: string;
    type: LikeType;
    createdAt?: any;
}

const LIKES_COLLECTION = "likes";
const MATCHES_COLLECTION = "matches";

export interface MatchData {
    userIds: string[];
    type: LikeType;
    matchedAt: any;
    users: Record<string, boolean>;
}

// Helper to generate consistent ID
const getLikeId = (fromUid: string, toUid: string) => `${fromUid}_${toUid}`;

export const LikesService = {
    // Get all matches for a user
    async getMatches(userId: string) {
        if (!db) return [];
        if (!userId) return [];

        try {
            const q = query(collection(db, MATCHES_COLLECTION), where(`users.${userId}`, "==", true));
            const snapshot = await getDocs(q);

            const firestore = db;
            const matchesWithProfiles = await Promise.all(snapshot.docs.map(async (matchDoc) => {
                const data = matchDoc.data() as MatchData;
                // Identify the "other" user
                const otherUserId = data.userIds.find(uid => uid !== userId);

                if (!otherUserId) return null;

                const profileRef = doc(firestore, "introductions", otherUserId);
                const profileSnap = await getDoc(profileRef);

                return {
                    matchId: matchDoc.id,
                    ...data,
                    otherUserId,
                    otherProfile: profileSnap.exists() ? profileSnap.data() : null
                };
            }));

            return matchesWithProfiles.filter(m => m !== null);
        } catch (error) {
            console.error("Error getting matches:", error);
            return [];
        }
    },

    // Toggle like: 
    // - If no like exists: Create it
    // - If like exists with same type: Remove it (Unlike)
    // - If like exists with different type: Update it (Change type)
    async toggleLike(fromUid: string, toUid: string, type: LikeType) {
        if (!db) return;
        const firestore = db;
        if (!fromUid || !toUid) return;

        const likeId = getLikeId(fromUid, toUid);
        const likeRef = doc(firestore, LIKES_COLLECTION, likeId);
        const likeSnap = await getDoc(likeRef);

        // Helper to handle match management
        const handleMatchLogic = async (currentType: LikeType) => {
            // Check reciprocal like
            const reciprocalId = getLikeId(toUid, fromUid);
            const reciprocalSnap = await getDoc(doc(firestore, LIKES_COLLECTION, reciprocalId));

            if (reciprocalSnap.exists()) {
                const reciprocalData = reciprocalSnap.data() as LikeData;
                const sortedIds = [fromUid, toUid].sort();
                const matchId = `${sortedIds[0]}_${sortedIds[1]}`;
                const matchRef = doc(firestore, MATCHES_COLLECTION, matchId);

                if (reciprocalData.type === currentType) {
                    // MATCH!
                    await setDoc(matchRef, {
                        userIds: sortedIds,
                        type: currentType,
                        matchedAt: serverTimestamp(),
                        users: {
                            [fromUid]: true,
                            [toUid]: true
                        }
                    }, { merge: true });
                } else {
                    // Mismatch - Ensure no match exists
                    const matchSnap = await getDoc(matchRef);
                    if (matchSnap.exists()) {
                        await deleteDoc(matchRef);
                    }
                }
            }
        };

        // Helper to delete match
        const handleDeleteMatch = async () => {
            const sortedIds = [fromUid, toUid].sort();
            const matchId = `${sortedIds[0]}_${sortedIds[1]}`;
            await deleteDoc(doc(firestore, MATCHES_COLLECTION, matchId));
        };


        if (likeSnap.exists()) {
            const currentData = likeSnap.data() as LikeData;
            if (currentData.type === type) {
                // Unlike
                await deleteDoc(likeRef);
                // Also break match if exists
                await handleDeleteMatch();
                return null;
            } else {
                // Change type
                await setDoc(likeRef, { type, createdAt: serverTimestamp() }, { merge: true });
                // Re-evaluate match
                await handleMatchLogic(type);
                return type;
            }
        } else {
            // New Like
            await setDoc(likeRef, {
                fromUserId: fromUid,
                toUserId: toUid,
                type,
                createdAt: serverTimestamp()
            });
            // Evaluate match
            await handleMatchLogic(type);
            return type;
        }
    },

    // Get specific like status
    async getLikeStatus(fromUid: string, toUid: string): Promise<LikeType | null> {
        if (!db) return null;
        if (!fromUid || !toUid) return null;
        const likeId = getLikeId(fromUid, toUid);
        const likeSnap = await getDoc(doc(db, LIKES_COLLECTION, likeId));
        if (likeSnap.exists()) {
            return (likeSnap.data() as LikeData).type;
        }
        return null;
    },

    // Listen to all likes BY the current user (for efficient UI state in grids)
    listenToMyLikes(userId: string, callback: (likes: Record<string, LikeType>) => void) {
        if (!db || !userId) return () => { };

        const q = query(collection(db, LIKES_COLLECTION), where("fromUserId", "==", userId));

        return onSnapshot(q, (snapshot) => {
            const likesMap: Record<string, LikeType> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data() as LikeData;
                likesMap[data.toUserId] = data.type;
            });
            callback(likesMap);
        });
    },

    // Get incoming likes for a user, including the liker's profile data
    async getIncomingLikes(userId: string) {
        if (!db) return [];
        if (!userId) return [];

        try {
            const q = query(collection(db, LIKES_COLLECTION), where("toUserId", "==", userId));
            const snapshot = await getDocs(q);

            const firestore = db;
            const likesWithProfiles = await Promise.all(snapshot.docs.map(async (likeDoc) => {
                const data = likeDoc.data() as LikeData;
                // Fetch the liker's introduction profile
                // Note: We access the 'introductions' collection using the fromUserId
                const profileRef = doc(firestore, "introductions", data.fromUserId);
                const profileSnap = await getDoc(profileRef);

                return {
                    likeId: likeDoc.id,
                    ...data,
                    likerProfile: profileSnap.exists() ? profileSnap.data() : null
                };
            }));

            return likesWithProfiles;
        } catch (error) {
            console.error("Error getting incoming likes:", error);
            return [];
        }
    },

    // Get sent likes (outgoing)
    async getOutgoingLikes(userId: string) {
        if (!db) return [];
        if (!userId) return [];

        try {
            const q = query(collection(db, LIKES_COLLECTION), where("fromUserId", "==", userId));
            const snapshot = await getDocs(q);

            const firestore = db;
            const likesWithProfiles = await Promise.all(snapshot.docs.map(async (likeDoc) => {
                const data = likeDoc.data() as LikeData;
                // Fetch the RECEIVER'S introduction profile
                const profileRef = doc(firestore, "introductions", data.toUserId);
                const profileSnap = await getDoc(profileRef);

                return {
                    likeId: likeDoc.id,
                    ...data,
                    targetProfile: profileSnap.exists() ? profileSnap.data() : null
                };
            }));

            return likesWithProfiles;
        } catch (error) {
            console.error("Error getting outgoing likes:", error);
            return [];
        }
    },

    // Reject/Remove incoming like
    async rejectLike(fromUid: string, toUid: string) {
        if (!db) return;
        const likeId = getLikeId(fromUid, toUid);
        await deleteDoc(doc(db, LIKES_COLLECTION, likeId));
    },

    // Listen to ALL likes (incoming and outgoing) to keep UI in sync
    listenToMatchmaking(userId: string, callback: () => void) {
        console.log("Setting up matchmaking listener for", userId);
        if (!db || !userId) return () => { };

        // Hacky but effective: Listen to ANY change in likes involving me
        // Actually, we can just listen to the collection in general if validation rules allowed,
        // but it's better to listen to queries.
        // For efficiency, we might just poll or rely on manual refresh, but let's try 
        // two listeners?

        const q1 = query(collection(db, LIKES_COLLECTION), where("fromUserId", "==", userId));
        const q2 = query(collection(db, LIKES_COLLECTION), where("toUserId", "==", userId));
        const q3 = query(collection(db, MATCHES_COLLECTION), where(`users.${userId}`, "==", true));

        // Combining 3 listeners into one callback trigger
        const unsub1 = onSnapshot(q1, () => callback());
        const unsub2 = onSnapshot(q2, () => callback());
        const unsub3 = onSnapshot(q3, () => callback());

        return () => {
            unsub1();
            unsub2();
            unsub3();
        };
    }
};
