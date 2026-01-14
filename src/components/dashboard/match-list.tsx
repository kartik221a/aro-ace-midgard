"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";
import { MatchCard } from "./match-card";
import { Users, Heart } from "lucide-react";
import { Introduction } from "@/types";

interface MatchListProps {
    type: LikeType;
    mode: "requests" | "matches" | "sent";
}

export function MatchList({ type, mode }: MatchListProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);

    const fetchData = async () => {
        if (!user) return;

        // Don't set loading to true on every update to prevent flicker, 
        // only if we have no items yet.
        if (items.length === 0) setLoading(true);

        try {
            if (mode === 'sent') {
                const [outgoingLikes, matches] = await Promise.all([
                    LikesService.getOutgoingLikes(user.uid),
                    LikesService.getMatches(user.uid)
                ]);

                const relevantLikes = outgoingLikes.filter(l => l.type === type);

                const pendingLikes = relevantLikes.filter(like => {
                    // Check if a match exists with this person
                    // Note: outgoingLikes has `toUserId` as the target
                    const hasMatch = matches.some(m => m.otherUserId === like.toUserId);
                    return !hasMatch;
                });

                setItems(pendingLikes.map(l => ({
                    id: l.likeId,
                    profile: l.targetProfile,
                    type: l.type,
                    userId: l.toUserId
                })));

            } else {
                const [incomingLikes, matches] = await Promise.all([
                    LikesService.getIncomingLikes(user.uid),
                    LikesService.getMatches(user.uid)
                ]);

                if (mode === "requests") {
                    // Show incoming likes of this type...
                    // ...where we DO NOT have a match yet.
                    const relevantLikes = incomingLikes.filter(l => l.type === type);

                    const unmatchedLikes = relevantLikes.filter(like => {
                        const hasMatch = matches.some(m => m.otherUserId === like.fromUserId);
                        return !hasMatch;
                    });

                    setItems(unmatchedLikes.map(l => ({
                        id: l.likeId,
                        profile: l.likerProfile,
                        type: l.type,
                        userId: l.fromUserId
                    })));

                } else {
                    // Show matches of this type
                    const relevantMatches = matches.filter(m => m.type === type);

                    setItems(relevantMatches.map(m => ({
                        id: m.matchId,
                        profile: m.otherProfile,
                        type: m.type,
                        userId: m.otherUserId
                    })));
                }
            }
        } catch (error) {
            console.error("Error fetching match data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        // Use real-time listener
        const unsubscribe = LikesService.listenToMatchmaking(user.uid, () => {
            // When changes occur, re-fetch the data.
            fetchData();
        });

        // Initial fetch
        fetchData();

        return () => unsubscribe();
    }, [user, type, mode]);

    const handlePass = async (targetUserId: string) => {
        if (!user) return;
        const isSent = mode === 'sent';
        const message = isSent
            ? "Are you sure you want to cancel this request?"
            : "Are you sure you want to pass? This request will be removed.";

        if (confirm(message)) {
            // Optimistic update
            setItems(prev => prev.filter(i => i.userId !== targetUserId));

            if (isSent) {
                // Cancel my like: I am fromUid, they are toUid
                await LikesService.rejectLike(user.uid, targetUserId);
            } else {
                // Reject their like: They are fromUid, I am toUid
                await LikesService.rejectLike(targetUserId, user.uid);
            }
            // The listener will also trigger a refresh to ensure consistency
        }
    };

    if (loading && items.length === 0) {
        return <div className="p-8 text-center text-slate-400 animate-pulse">Loading...</div>;
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                {type === 'friend' ? <Users className="w-12 h-12 mx-auto text-slate-200 mb-4" /> : <Heart className="w-12 h-12 mx-auto text-slate-200 mb-4" />}
                <h3 className="text-slate-600 font-medium text-lg">
                    {mode === 'requests' ? 'No pending requests'
                        : mode === 'sent' ? 'No sent requests'
                            : 'No matches yet'}
                </h3>
                <p className="text-slate-400 mt-1">
                    {mode === 'requests'
                        ? `People who like you as a ${type === 'friend' ? 'friend' : 'partner'} will appear here.`
                        : mode === 'sent'
                            ? `People you liked as a ${type === 'friend' ? 'friend' : 'partner'} but haven't responded yet.`
                            : `When you allow a request, your matches will appear here.`}
                </p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <MatchCard
                    key={item.id}
                    profile={item.profile as Introduction}
                    type={type}
                    isMatch={mode === 'matches'}
                    isSent={mode === 'sent'}
                    onPass={() => handlePass(item.userId)}
                />
            ))}
        </div>
    );
}
