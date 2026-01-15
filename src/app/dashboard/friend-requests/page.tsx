"use client";
import { MatchList } from "@/components/dashboard/match-list";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import GradientText from "@/components/GradientText";

export default function FriendRequestsPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto pt-24 pb-20 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-12">
                <GradientText
                    colors={['#38bdf8', '#0ea5e9', '#0284c7']} // Light Blue Gradient
                    animationSpeed={3}
                    showBorder={false}
                    className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                >
                    Friend Requests {counts.friendRequests > 0 && `(${counts.friendRequests})`}
                </GradientText>
                <p className="text-slate-400 text-lg max-w-2xl">
                    Connect with people interested in building a meaningful friendship with you.
                </p>
            </div>

            <MatchList type="friend" mode="requests" />
        </div>
    );
}
