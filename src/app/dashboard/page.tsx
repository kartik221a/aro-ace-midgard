"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionDivider } from "@/components/ui/section-divider";
import { PhasedIntroductionForm } from "@/components/forms/phased-introduction-form";
import { ProfileDisplay } from "@/components/profile-display";
import { Edit2, Users, Heart } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LikesTab } from "@/components/dashboard/likes-tab";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [introduction, setIntroduction] = useState<Introduction | null>(null);
    const [fetching, setFetching] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // New Hook for real-time counts
    const { counts } = useMatchmakingCounts();

    const fetchIntroduction = async () => {
        if (user && db) {
            try {
                const docRef = doc(db, "introductions", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setIntroduction(docSnap.data() as Introduction);
                }
            } catch (error) {
                console.error("Error fetching introduction:", error);
            } finally {
                setFetching(false);
            }
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }
        fetchIntroduction();
    }, [user, loading, router]);

    const handleSuccess = () => {
        setIsEditing(false);
        fetchIntroduction();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading || fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-rose-300">Loading your space...</div>
            </div>
        );
    }

    if (!user) return null;

    // Helper for Age
    const calculateAge = (dobString?: string) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    // ... (keep calculateAge helper)

    return (
        <div className="min-h-screen pb-20 bg-slate-50">
            {/* Simple Tabs for Dashboard */}
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {isEditing ? (
                    // When editing, take over the full view for focus
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">
                                {introduction ? "Edit Your Introduction" : "Create Your Introduction"}
                            </h2>
                            {introduction && (
                                <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            )}
                        </div>
                        <PhasedIntroductionForm
                            initialData={introduction || undefined}
                            onSuccess={handleSuccess}
                        />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                        </div>

                        {/* Navigation Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link href="/dashboard/friend-requests">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-sky-100 hover:border-sky-300 relative overflow-visible">
                                    {counts.friendRequests > 0 && (
                                        <Badge className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 border-2 border-white">{counts.friendRequests}</Badge>
                                    )}
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                        <div className="p-3 bg-sky-100 rounded-full text-sky-600">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">Friend Requests</div>
                                            <div className="text-xs text-slate-400">Incoming likes</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/dashboard/friend-matches">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-sky-100 hover:border-sky-300 relative overflow-visible">
                                    {counts.friendMatches > 0 && (
                                        <Badge className="absolute -top-2 -right-2 bg-sky-500 hover:bg-sky-600 border-2 border-white">{counts.friendMatches}</Badge>
                                    )}
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                        <div className="p-3 bg-sky-500 rounded-full text-white">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">Friend Matches</div>
                                            <div className="text-xs text-slate-400">Your friends</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/dashboard/partner-requests">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-rose-100 hover:border-rose-300 relative overflow-visible">
                                    {counts.partnerRequests > 0 && (
                                        <Badge className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 border-2 border-white">{counts.partnerRequests}</Badge>
                                    )}
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                        <div className="p-3 bg-rose-100 rounded-full text-rose-600">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">Partner Requests</div>
                                            <div className="text-xs text-slate-400">Incoming interest</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/dashboard/partner-matches">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-rose-100 hover:border-rose-300 relative overflow-visible">
                                    {counts.partnerMatches > 0 && (
                                        <Badge className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 border-2 border-white">{counts.partnerMatches}</Badge>
                                    )}
                                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                        <div className="p-3 bg-rose-500 rounded-full text-white">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">Partner Matches</div>
                                            <div className="text-xs text-slate-400">Your matches</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>

                            <Link href="/dashboard/sent-requests" className="sm:col-span-2 lg:col-span-4">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-slate-100 hover:border-slate-300 bg-slate-50/50 relative overflow-visible">
                                    {counts.sentRequests > 0 && (
                                        <Badge className="absolute -top-2 -right-2 bg-slate-500 hover:bg-slate-600 border-2 border-white">{counts.sentRequests}</Badge>
                                    )}
                                    <CardContent className="p-4 flex flex-row items-center justify-center gap-3">
                                        <div className="font-bold text-slate-600">View Sent Requests</div>
                                        <div className="text-xs text-slate-400 bg-slate-200 px-2 py-1 rounded-full">Outgoing</div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>


                        <SectionDivider />

                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-700">My Profile</h2>

                            {!introduction ? (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-slate-300">
                                    <h3 className="text-lg font-medium text-slate-700 mb-2">You haven't created a profile yet</h3>
                                    <p className="text-slate-500 mb-6">Create your profile to start connecting with others.</p>
                                    <Button onClick={() => setIsEditing(true)}>Create Profile</Button>
                                </div>
                            ) : (
                                <>
                                    {/* Status Feedback for Rejection */}
                                    {introduction.status === 'rejected' && (
                                        <div className="mt-4 mb-4">
                                            <Card className="border-l-4 border-l-red-500 shadow-md">
                                                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                                    <div className="text-red-800">
                                                        <span className="font-bold">Profile Returned:</span> {introduction.rejectionReason}
                                                    </div>
                                                    <Button variant="destructive" onClick={() => setIsEditing(true)}>Fix & Resubmit</Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    <ProfileDisplay
                                        introduction={introduction}
                                        isOwnProfile
                                        topOverlay={
                                            <div className="flex items-center gap-3">
                                                <Badge className={`text-sm px-3 py-1 shadow-sm backdrop-blur-md
                                                    ${introduction.status === 'approved' ? 'bg-green-500/90 text-white hover:bg-green-500' : ''}
                                                    ${introduction.status === 'pending' ? 'bg-yellow-500/90 text-white hover:bg-yellow-500' : ''}
                                                    ${introduction.status === 'rejected' ? 'bg-red-500/90 text-white hover:bg-red-500' : ''}
                                                `}>
                                                    {introduction?.status?.toUpperCase() || 'UNKNOWN'}
                                                </Badge>

                                                {introduction.status !== 'pending' && (
                                                    <Button
                                                        onClick={() => setIsEditing(true)}
                                                        className="bg-white/90 text-slate-800 hover:bg-white shadow-lg backdrop-blur-sm"
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                                                    </Button>
                                                )}
                                            </div>
                                        }
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
