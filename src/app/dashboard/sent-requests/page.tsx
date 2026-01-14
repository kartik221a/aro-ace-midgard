"use client";

import { useAuth } from "@/lib/auth-context";
import { MatchList } from "@/components/dashboard/match-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";

export default function SentRequestsPage() {
    const { counts } = useMatchmakingCounts();
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Sent Requests {counts.sentRequests > 0 && <span className="text-slate-500 text-2xl">({counts.sentRequests})</span>}
                    </h1>
                    <p className="text-slate-500">People you liked who haven't responded yet.</p>
                </div>
            </div>

            <Tabs defaultValue="friend" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="friend">
                        Friend Requests {counts.sentFriendRequests > 0 && `(${counts.sentFriendRequests})`}
                    </TabsTrigger>
                    <TabsTrigger value="relationship">
                        Partner Requests {counts.sentPartnerRequests > 0 && `(${counts.sentPartnerRequests})`}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="friend" className="mt-6">
                    <MatchList type="friend" mode="sent" />
                </TabsContent>

                <TabsContent value="relationship" className="mt-6">
                    <MatchList type="relationship" mode="sent" />
                </TabsContent>
            </Tabs>
        </div>
    );
}
