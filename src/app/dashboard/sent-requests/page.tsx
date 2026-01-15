"use client";

import { useAuth } from "@/lib/auth-context";
import { MatchList } from "@/components/dashboard/match-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import GradientText from "@/components/GradientText";

export default function SentRequestsPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="container mx-auto pt-24 pb-20 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-12">
                <GradientText
                    colors={['#f59e0b', '#d97706', '#b45309']} // Yellow/Amber Gradient
                    animationSpeed={3}
                    showBorder={false}
                    className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
                >
                    Sent Requests {counts.sentRequests > 0 && `(${counts.sentRequests})`}
                </GradientText>
                <p className="text-slate-400 text-lg max-w-2xl mb-8">
                    Keep track of the connections you've initiated. These people haven't responded yet.
                </p>

                <Tabs defaultValue="friend" className="w-full">
                    <div className="flex justify-center mb-10">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-white/5 border border-white/10 backdrop-blur-md">
                            <TabsTrigger value="friend" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-200">
                                Friendships {counts.sentFriendRequests > 0 && `(${counts.sentFriendRequests})`}
                            </TabsTrigger>
                            <TabsTrigger value="relationship" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-200">
                                Partnerships {counts.sentPartnerRequests > 0 && `(${counts.sentPartnerRequests})`}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="friend" className="mt-0 outline-none">
                        <MatchList type="friend" mode="sent" />
                    </TabsContent>

                    <TabsContent value="relationship" className="mt-0 outline-none">
                        <MatchList type="relationship" mode="sent" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
