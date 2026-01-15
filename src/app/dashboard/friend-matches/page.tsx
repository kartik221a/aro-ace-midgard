"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import GradientText from "@/components/GradientText";

export default function FriendMatchesPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto pt-24 pb-20 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-12">
                <GradientText
                    colors={['#2563eb', '#1d4ed8', '#1e40af']} // Dark Blue Gradient
                    animationSpeed={3}
                    showBorder={false}
                    className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                >
                    Friend Matches {counts.friendMatches > 0 && `(${counts.friendMatches})`}
                </GradientText>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Congratulations! You both want to build a deep friendship with each other.
                </p>
            </div>

            <MatchList type="friend" mode="matches" />
        </div>
    );
}
