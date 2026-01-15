"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { Button } from "@/components/ui/button";
import { PhasedIntroductionForm } from "@/components/forms/phased-introduction-form";
import { ProfileDisplay } from "@/components/profile-display";
import { Edit2, Users, Heart } from "lucide-react";
import Link from "next/link";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import { SplitText } from "@/components/ui/reactbits/split-text";
import { motion } from "framer-motion";

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
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#6fcf97]/30 border-t-[#6fcf97] rounded-full animate-spin" />
                    <div className="text-[#a0c4ff] font-medium animate-pulse">Loading your space...</div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen pb-20 pt-24 px-4">
            <div className="container mx-auto max-w-6xl">
                {isEditing ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="mb-8 flex justify-between items-center bg-white/5 p-4 rounded-xl backdrop-blur-md border border-white/10">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {introduction ? "Edit Your Introduction" : "Create Your Introduction"}
                            </h2>
                            {introduction && (
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-white/10 text-slate-300 hover:text-white">Cancel</Button>
                            )}
                        </div>
                        <div className="glass p-6 rounded-2xl">
                            <PhasedIntroductionForm
                                initialData={introduction || undefined}
                                onSuccess={handleSuccess}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">
                                    <SplitText
                                        text="Dashboard"
                                        className="text-4xl font-bold text-white inline-block"
                                        delay={0.1}
                                    />
                                </h1>
                                <p className="text-slate-400">Manage your profile and connections from here.</p>
                            </div>
                        </div>

                        {/* Bento Grid Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[160px]">
                            {/* Friend Requests - Large Tile */}
                            <Link href="/dashboard/friend-requests" className="col-span-1 lg:col-span-2 row-span-1 group">
                                <SpotlightCard className="h-full bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-6 hover:bg-indigo-500/10 transition-all duration-500 group-hover:border-indigo-500/30" spotlightColor="rgba(99, 102, 241, 0.2)">
                                    <div className="h-full flex flex-row items-center justify-between">
                                        <div className="flex flex-col justify-center h-full">
                                            <div className="p-3 w-fit bg-indigo-500/20 rounded-2xl text-indigo-300 mb-3 group-hover:scale-110 transition-transform duration-300">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="font-bold text-xl text-slate-100">Friend Requests</div>
                                            <div className="text-sm text-slate-400">Expand your circle</div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {counts.friendRequests > 0 ? (
                                                <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/30 animate-pulse">
                                                    {counts.friendRequests}
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-500 border border-white/5">
                                                    0
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </Link>

                            {/* Partner Requests - Large Tile */}
                            <Link href="/dashboard/partner-requests" className="col-span-1 lg:col-span-2 row-span-1 group">
                                <SpotlightCard className="h-full bg-pink-500/5 border border-pink-500/10 rounded-3xl p-6 hover:bg-pink-500/10 transition-all duration-500 group-hover:border-pink-500/30" spotlightColor="rgba(236, 72, 153, 0.2)">
                                    <div className="h-full flex flex-row items-center justify-between">
                                        <div className="flex flex-col justify-center h-full">
                                            <div className="p-3 w-fit bg-pink-500/20 rounded-2xl text-pink-300 mb-3 group-hover:scale-110 transition-transform duration-300">
                                                <Heart className="w-6 h-6" />
                                            </div>
                                            <div className="font-bold text-xl text-slate-100">Partner Requests</div>
                                            <div className="text-sm text-slate-400">Connect deeper</div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {counts.partnerRequests > 0 ? (
                                                <div className="h-16 w-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-pink-500/30 animate-pulse">
                                                    {counts.partnerRequests}
                                                </div>
                                            ) : (
                                                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-slate-500 border border-white/5">
                                                    0
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </Link>

                            {/* Friend Matches - Small Tile */}
                            <Link href="/dashboard/friend-matches" className="col-span-1 group">
                                <SpotlightCard className="h-full bg-teal-500/5 border border-teal-500/10 rounded-3xl p-5 hover:bg-teal-500/10 transition-all duration-500" spotlightColor="rgba(20, 184, 166, 0.2)">
                                    <div className="h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span className="text-2xl font-bold text-white">{counts.friendMatches}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-200">Friends</div>
                                            <div className="text-xs text-slate-500">Matches</div>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </Link>

                            {/* Partner Matches - Small Tile */}
                            <Link href="/dashboard/partner-matches" className="col-span-1 group">
                                <SpotlightCard className="h-full bg-rose-500/5 border border-rose-500/10 rounded-3xl p-5 hover:bg-rose-500/10 transition-all duration-500" spotlightColor="rgba(244, 63, 94, 0.2)">
                                    <div className="h-full flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-300">
                                                <Heart className="w-5 h-5" />
                                            </div>
                                            <span className="text-2xl font-bold text-white">{counts.partnerMatches}</span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-200">Partners</div>
                                            <div className="text-xs text-slate-500">Matches</div>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </Link>

                            {/* Sent Requests - Wide Tile */}
                            <Link href="/dashboard/sent-requests" className="col-span-1 lg:col-span-2 group">
                                <SpotlightCard className="h-full bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all duration-500" spotlightColor="rgba(255, 255, 255, 0.1)">
                                    <div className="h-full flex items-center justify-between px-2">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/10 rounded-full group-hover:rotate-12 transition-transform duration-300">
                                                <Users className="w-5 h-5 text-slate-300" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200">Sent Requests</div>
                                                <div className="text-xs text-slate-500">Waiting for response</div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 font-mono text-slate-300">
                                            {counts.sentRequests} Pending
                                        </div>
                                    </div>
                                </SpotlightCard>
                            </Link>
                        </div>


                        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <h2 className="text-2xl font-bold text-slate-100">My Profile</h2>
                                {introduction && introduction.status !== 'pending' && (
                                    <MagnetButton
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg"
                                        strength={20}
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                                    </MagnetButton>
                                )}
                            </div>

                            {!introduction ? (
                                <SpotlightCard className="text-center py-16 border-dashed border-2 border-white/20 bg-transparent hover:bg-white/5 rounded-2xl" spotlightColor="rgba(255, 255, 255, 0.1)">
                                    <h3 className="text-xl font-medium text-slate-200 mb-3">You haven't created a profile yet</h3>
                                    <p className="text-slate-400 mb-8 max-w-md mx-auto">Create your profile to start connecting with other members of the community.</p>
                                    <MagnetButton onClick={() => setIsEditing(true)} className="bg-[#6fcf97] text-black font-bold hover:bg-[#5dbb85] px-6 py-3 rounded-xl shadow-lg shadow-[#6fcf97]/20">
                                        Create Profile
                                    </MagnetButton>
                                </SpotlightCard>
                            ) : (
                                <>
                                    {introduction.status === 'rejected' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-4"
                                        >
                                            <div className="text-red-200">
                                                <span className="font-bold text-red-100">Profile Returned:</span> {introduction.rejectionReason}
                                            </div>
                                            <Button variant="destructive" onClick={() => setIsEditing(true)}>Fix & Resubmit</Button>
                                        </motion.div>
                                    )}

                                    <div className="glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                                        {/* Status Tag */}
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className={`
                                                px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg border border-white/10
                                                ${introduction.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' : ''}
                                                ${introduction.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : ''}
                                                ${introduction.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' : ''}
                                            `}>
                                                {introduction?.status || 'UNKNOWN'}
                                            </div>
                                        </div>

                                        <ProfileDisplay
                                            introduction={introduction}
                                            isOwnProfile
                                            topOverlay={<></>} // Handled by outer container now for cleaner layout
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
