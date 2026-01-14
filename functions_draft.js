/**
 * CLOUD FUNCTION DRAFT - MATCHING LOGIC
 * 
 * Deploy this to Firebase Cloud Functions (Node.js).
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

exports.onLikeCreatedOrUpdated = functions.firestore
    .document("likes/{likeId}")
    .onWrite(async (change, context) => {
        const after = change.after.exists ? change.after.data() : null;
        const before = change.before.exists ? change.before.data() : null;

        // 1. If like was deleted, we might want to invalidate matches?
        // For MVP, we can keep the match or delete it. 
        // Let's say if you unlike, the match should be broken.
        if (!after) {
            // Like deleted. Check if there was a match and delete it.
            // (Optional for MVP: Complex to find specific match doc without ID reference, 
            // but we can query 'matches' where 'userIds' contains both)
            const fromUid = before.fromUserId;
            const toUid = before.toUserId;
            await deleteMatch(fromUid, toUid);
            return;
        }

        // 2. New Like or Updated Like
        const fromUid = after.fromUserId;
        const toUid = after.toUserId;
        const typeA = after.type;

        // 3. Check for RECIPROCAL like (Did B like A?)
        // ID for B->A would be: toUid_fromUid
        const resultId = `${toUid}_${fromUid}`;
        const reciprocalSnap = await db.collection("likes").doc(resultId).get();

        if (!reciprocalSnap.exists) {
            // No reciprocal like yet. No match.
            return;
        }

        const reciprocalData = reciprocalSnap.data();
        const typeB = reciprocalData.type;

        // 4. MATCH LOGIC
        // Only match if types are identical
        if (typeA === typeB) {
            // Create Match
            // Use a consistent ID for the match doc to prevent duplicates: sort UIDs
            const sortedIds = [fromUid, toUid].sort();
            const matchId = `${sortedIds[0]}_${sortedIds[1]}`;

            await db.collection("matches").doc(matchId).set({
                userIds: sortedIds,
                type: typeA, // 'friend' or 'relationship'
                matchedAt: admin.firestore.FieldValue.serverTimestamp(),
                users: {
                    [fromUid]: true,
                    [toUid]: true
                }
            }, { merge: true });

            console.log(`Match created (${typeA}) between ${fromUid} and ${toUid}`);

            // TODO: Send Notification to both users
        } else {
            // Types don't match (e.g. one wants friend, other wants relationship)
            // Check if a match existed previously (maybe they changed their mind?)
            // If so, delete it.
            await deleteMatch(fromUid, toUid);
        }
    });

async function deleteMatch(uid1, uid2) {
    const sortedIds = [uid1, uid2].sort();
    const matchId = `${sortedIds[0]}_${sortedIds[1]}`;
    await db.collection("matches").doc(matchId).delete();
}
