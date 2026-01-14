"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { Button } from "@/components/ui/button";
import { ProfileDisplay } from "@/components/profile-display";

import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";

export default function ProfilePage() {
    const { user } = useAuth();
    const params = useParams();
    const uid = params.uid as string;
    const [introduction, setIntroduction] = useState<Introduction | null>(null);
    const [myLikeStatus, setMyLikeStatus] = useState<LikeType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;
        const fetchIntro = async () => {
            if (!db) return;
            try {
                const docRef = doc(db, "introductions", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setIntroduction(docSnap.data() as Introduction);

                    // Fetch like status if user is logged in
                    if (user) {
                        const status = await LikesService.getLikeStatus(user.uid, uid);
                        setMyLikeStatus(status);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchIntro();
    }, [uid, user]);

    // ... existing loading / error states ...

    // Handle Toggle
    const handleToggleLike = async (type: LikeType) => {
        if (!user || !introduction) {
            alert("Please sign in to like!");
            return;
        }

        // Optimistic Update
        const oldStatus = myLikeStatus;
        const newStatus = oldStatus === type ? null : type;
        setMyLikeStatus(newStatus);

        try {
            await LikesService.toggleLike(user.uid, introduction.uid, type);
        } catch (error) {
            console.error("Failed to toggle like", error);
            setMyLikeStatus(oldStatus); // Revert on error
        }
    };

    if (loading) return (
        <div className="container mx-auto py-12 px-4">
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse mb-8" />
            <div className="space-y-4">
                <div className="h-8 w-1/3 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-slate-100 rounded animate-pulse" />
            </div>
        </div>
    );

    if (!introduction) {
        return (
            <div className="container mx-auto py-20 text-center space-y-6">
                <h1 className="text-3xl font-bold text-slate-800">Profile Not Found</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    The user has not created an introduction yet, or the profile you are looking for does not exist.
                </p>
                <Button onClick={() => window.location.href = "/"}>Go Home</Button>
            </div>
        );
    }

    const { basicInfo, identity, lookingFor, lifestyle, longDescription, images } = introduction;

    // Helper to calculate age
    const calculateAge = (dobString?: string) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };
    const age = calculateAge(basicInfo?.dob);

    const isOwnProfile = user?.uid === introduction.uid;

    return (
        <ProfileDisplay
            introduction={introduction}
            isOwnProfile={isOwnProfile}
            myLikeStatus={myLikeStatus}
            onToggleLike={handleToggleLike}
        />
    );
}
