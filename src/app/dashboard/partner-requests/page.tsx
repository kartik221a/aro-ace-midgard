"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import GradientText from "@/components/GradientText";

export default function PartnerRequestsPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto pt-24 pb-20 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-12">
                <GradientText
                    colors={['#f472b6', '#ec4899', '#db2777']} // Light Red Gradient
                    animationSpeed={3}
                    showBorder={false}
                    className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                >
                    Partner Requests {counts.partnerRequests > 0 && `(${counts.partnerRequests})`}
                </GradientText>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Explore potential partners who are interested in building a romantic relationship with you.
                </p>
            </div>

            <MatchList type="relationship" mode="requests" />
        </div>
    );
}
