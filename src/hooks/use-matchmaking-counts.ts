
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { LikeType, LikeData, MatchData } from "@/lib/services/likes";

export function useMatchmakingCounts() {
    const { user } = useAuth();
    const [counts, setCounts] = useState({
        friendRequests: 0,
        friendMatches: 0,
        partnerRequests: 0,
        partnerMatches: 0,
        sentRequests: 0,
        sentFriendRequests: 0,
        sentPartnerRequests: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        const likesRef = collection(db, "likes");
        const matchesRef = collection(db, "matches");

        // 1. Incoming Likes (Requests)
        const qIncoming = query(likesRef, where("toUserId", "==", user.uid));

        // 2. Outgoing Likes (Sent)
        const qOutgoing = query(likesRef, where("fromUserId", "==", user.uid));

        // 3. Matches
        const qMatches = query(matchesRef, where(`users.${user.uid}`, "==", true));

        // We need to deduplicate based on matches. 
        // A "Request" is an incoming like where NO match exists.

        let incomingLikes: LikeData[] = [];
        let outgoingLikes: LikeData[] = [];
        let matches: MatchData[] = [];

        const updateCounts = () => {
            // Helper set for fast match lookups
            const matchIds = new Set<string>(); // "minUid_maxUid"
            const matchedUserIds = new Set<string>();

            matches.forEach(m => {
                m.userIds.forEach(uid => {
                    if (uid !== user.uid) matchedUserIds.add(uid);
                });
            });

            // Filter Requests (Incoming likes that are NOT matched)
            const trueFriendRequests = incomingLikes.filter(l => l.type === "friend" && !matchedUserIds.has(l.fromUserId));
            const truePartnerRequests = incomingLikes.filter(l => l.type === "relationship" && !matchedUserIds.has(l.fromUserId));

            // Matches Count
            const friendMatchesCount = matches.filter(m => m.type === "friend").length;
            const partnerMatchesCount = matches.filter(m => m.type === "relationship").length;

            // Sent Requests (Outgoing likes that are NOT matched)
            const trueSentFriend = outgoingLikes.filter(l => l.type === "friend" && !matchedUserIds.has(l.toUserId));
            const trueSentPartner = outgoingLikes.filter(l => l.type === "relationship" && !matchedUserIds.has(l.toUserId));

            setCounts({
                friendRequests: trueFriendRequests.length,
                partnerRequests: truePartnerRequests.length,
                friendMatches: friendMatchesCount,
                partnerMatches: partnerMatchesCount,
                sentRequests: trueSentFriend.length + trueSentPartner.length,
                sentFriendRequests: trueSentFriend.length,
                sentPartnerRequests: trueSentPartner.length
            });
            setLoading(false);
        };

        const unsub1 = onSnapshot(qIncoming, (snap) => {
            incomingLikes = snap.docs.map(d => d.data() as LikeData);
            updateCounts();
        });

        const unsub2 = onSnapshot(qOutgoing, (snap) => {
            outgoingLikes = snap.docs.map(d => d.data() as LikeData);
            updateCounts();
        });

        const unsub3 = onSnapshot(qMatches, (snap) => {
            matches = snap.docs.map(d => d.data() as MatchData);
            updateCounts();
        });

        return () => {
            unsub1();
            unsub2();
            unsub3();
        };
    }, [user]);

    return { counts, loading };
}
