"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";

export default function PartnerMatchesPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <h1 className="text-2xl font-bold mb-2 text-pink-700">
                Partner Matches {counts.partnerMatches > 0 && <span className="text-pink-400">({counts.partnerMatches})</span>}
            </h1>
            <p className="text-slate-500 mb-8">You matched for a potential relationship!</p>
            <MatchList type="relationship" mode="matches" />
        </div>
    );
}
