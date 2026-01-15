"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { AdminIntroductionList } from "@/components/admin/admin-introduction-list";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction, IntroductionStatus } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { getDoc } from "firebase/firestore";


import { SplitText } from "@/components/ui/reactbits/split-text";

export default function AdminApprovedPage() {
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const q = query(
            collection(db!, "introductions"),
            where("status", "==", "approved")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIntroductions(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as Introduction)));
        });
        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (uid: string, status: IntroductionStatus, reason?: string) => {
        if (!user) return;

        const updateData: any = {
            status,
            updatedAt: serverTimestamp(),
        };

        try {
            const docRef = doc(db!, "introductions", uid);
            if (status === 'approved') {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const intro = docSnap.data() as Introduction;
                    if (intro.pendingUpdate) {
                        // Merge pendingUpdate into root
                        const { pendingUpdate, ...rest } = intro;
                        const mergedData = {
                            ...rest,
                            ...pendingUpdate,
                            status: 'approved' as IntroductionStatus,
                            approvedBy: user.uid,
                            reviewedAt: Date.now(),
                            updatedAt: serverTimestamp(),
                            pendingUpdate: null // Clear it
                        };
                        await updateDoc(docRef, mergedData);
                        return;
                    }
                }
            }

            // Fallback for simple status updates or rejections
            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/40 hover:border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md">
                            <Link href="/admin"><ChevronLeft className="h-5 w-5" /></Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            <SplitText
                                text="Approved Profiles"
                                className="text-3xl font-bold text-white inline-block"
                                delay={0.1}
                            />
                        </h1>
                    </div>
                    <AdminIntroductionList
                        introductions={introductions}
                        type="approved"
                        onUpdateStatus={handleUpdateStatus}
                    />
                </div>
            </div>
        </AdminGuard>
    );
}
