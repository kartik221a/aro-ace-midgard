"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import GradientText from "@/components/GradientText";

export default function PartnerMatchesPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto pt-24 pb-20 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-12">
                <GradientText
                    colors={['#e11d48', '#be123c', '#9f1239']} // Dark Red Gradient
                    animationSpeed={3}
                    showBorder={false}
                    className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                >
                    Partner Matches {counts.partnerMatches > 0 && `(${counts.partnerMatches})`}
                </GradientText>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Amazing! You both found a special spark. This could be the start of something beautiful.
                </p>
            </div>

            <MatchList type="relationship" mode="matches" />
        </div>
    );
}
