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
import { Edit2, Users, Heart, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useMatchmakingCounts } from "@/hooks/use-matchmaking-counts";
import MagicBento from "@/components/ui/reactbits/MagicBento";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import GradientText from "@/components/GradientText";
import { motion } from "framer-motion";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import { cn } from "@/lib/utils";

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
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-pink-500 rounded-full animate-spin" />
                    <div className="text-purple-300 font-medium animate-pulse">Loading your space...</div>
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
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="hover:bg-purple-500/10 text-slate-400 hover:text-purple-300 border border-transparent hover:border-purple-500/20 transition-all">Cancel</Button>
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
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-full">
                                <GradientText
                                    colors={["#a855f7", "#d946ef", "#ec4899"]} // Purple to Fuchsia to Pink
                                    animationSpeed={3}
                                    showBorder={false}
                                    className="text-4xl md:text-5xl font-bold tracking-tight"
                                >
                                    Dashboard
                                </GradientText>
                                <p className="text-slate-400 mt-4 text-lg">Manage your profile and connections from here.</p>
                            </div>
                        </div>

                        {/* Magic Bento Stats */}
                        <div className="w-full">
                            <MagicBento
                                spotlightRadius={800}
                                enableBorderGlow={true}
                                particleCount={100}
                                glowColor="207, 158, 255"
                                enableTilt={true}
                                clickEffect={true}
                                enableMagnetism={true}
                                cards={[
                                    {
                                        label: (
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className={cn("font-bold text-white px-1.5 py-0.5 rounded-md", counts.friendRequests > 0 ? "bg-sky-500/40" : "bg-white/10")}>
                                                    {counts.friendRequests}
                                                </span>
                                                New
                                            </span>
                                        ),
                                        title: <div className="flex items-center gap-2">Friend Requests</div>,
                                        description: "Expand your circle and find like-minded souls.",
                                        onClick: () => router.push("/dashboard/friend-requests"),
                                        className: counts.friendRequests > 0 ? "border-sky-500/50 bg-sky-500/10" : "",
                                        themeColor: "14, 165, 233" // Sky Blue
                                    },
                                    {
                                        label: (
                                            <span className="flex items-center gap-1.5">
                                                <Heart className="w-3.5 h-3.5" />
                                                <span className={cn("font-bold text-white px-1.5 py-0.5 rounded-md", counts.partnerRequests > 0 ? "bg-rose-500/40" : "bg-white/10")}>
                                                    {counts.partnerRequests}
                                                </span>
                                                New
                                            </span>
                                        ),
                                        title: <div className="flex items-center gap-2">Partner Requests</div>,
                                        description: "Connect deeper with potential life partners.",
                                        onClick: () => router.push("/dashboard/partner-requests"),
                                        className: counts.partnerRequests > 0 ? "border-rose-500/50 bg-rose-500/10" : "",
                                        themeColor: "244, 63, 94" // Light Red / Rose
                                    },
                                    {
                                        label: (
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="font-bold text-white px-1.5 py-0.5 rounded-md bg-white/10">
                                                    {counts.friendMatches}
                                                </span>
                                                Total
                                            </span>
                                        ),
                                        title: "Friends",
                                        description: "Your mutual friend connections.",
                                        onClick: () => router.push("/dashboard/friend-matches"),
                                        themeColor: "59, 130, 246" // Blue
                                    },
                                    {
                                        label: (
                                            <span className="flex items-center gap-1.5">
                                                <Heart className="w-3.5 h-3.5" />
                                                <span className="font-bold text-white px-1.5 py-0.5 rounded-md bg-white/10">
                                                    {counts.partnerMatches}
                                                </span>
                                                Total
                                            </span>
                                        ),
                                        title: "Partners",
                                        description: "Your mutual partner connections.",
                                        onClick: () => router.push("/dashboard/partner-matches"),
                                        themeColor: "239, 68, 68" // Red
                                    },
                                    {
                                        label: (
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 opacity-50" />
                                                <span className="font-bold text-white px-1.5 py-0.5 rounded-md bg-white/10">
                                                    {counts.sentRequests}
                                                </span>
                                                Sent
                                            </span>
                                        ),
                                        title: "Requests Sent",
                                        description: "Tracks your outgoing connection attempts.",
                                        onClick: () => router.push("/dashboard/sent-requests"),
                                        themeColor: "251, 191, 36" // Yellow / Amber
                                    }
                                ]}
                            />
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
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                                                    <AlertTriangle className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-red-100 font-bold text-lg mb-1">Reason for Rejection:</h4>
                                                    <p className="text-red-200/80 leading-relaxed">
                                                        {introduction.rejectionReason}
                                                    </p>
                                                </div>
                                            </div>
                                            <MagnetButton variant="destructive" onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shrink-0">
                                                Fix & Resubmit
                                            </MagnetButton>
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
