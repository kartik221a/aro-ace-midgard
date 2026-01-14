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


export default function AdminRejectedPage() {
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const q = query(
            collection(db!, "introductions"),
            where("status", "==", "rejected")
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

        if (status === 'approved') {
            updateData.approvedBy = user.uid;
        } else if (status === 'rejected') {
            updateData.rejectedBy = user.uid;
            if (reason) updateData.rejectionReason = reason;
        }

        try {
            await updateDoc(doc(db!, "introductions", uid), updateData);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    return (
        <AdminGuard>
            <div className="container py-10 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Rejected Requests</h1>
                </div>
                <AdminIntroductionList
                    introductions={introductions}
                    type="rejected"
                    onUpdateStatus={handleUpdateStatus}
                />
            </div>
        </AdminGuard>
    );
}
