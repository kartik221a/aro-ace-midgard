"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";

export default function FriendMatchesPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <h1 className="text-2xl font-bold mb-2 text-slate-800">
                Friend Matches {counts.friendMatches > 0 && <span className="text-slate-500">({counts.friendMatches})</span>}
            </h1>
            <p className="text-slate-500 mb-8">You both want to be friends!</p>
            <MatchList type="friend" mode="matches" />
        </div>
    );
}
