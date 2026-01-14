"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";

export default function PartnerRequestsPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <h1 className="text-2xl font-bold mb-2 text-pink-700">
                Partner Requests {counts.partnerRequests > 0 && <span className="text-pink-400">({counts.partnerRequests})</span>}
            </h1>
            <p className="text-slate-500 mb-8">People interested in a relationship with you.</p>
            <MatchList type="relationship" mode="requests" />
        </div>
    );
}
