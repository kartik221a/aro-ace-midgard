"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { AdminOverview } from "@/components/admin/admin-overview";
import { Loader2 } from "lucide-react";

import { SplitText } from "@/components/ui/reactbits/split-text";

export default function AdminPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [usersCount, setUsersCount] = useState(0);

    // Redirect if not admin
    useEffect(() => {
        if (!loading) {
            if (!user || userData?.role !== 'admin') {
                router.push("/");
            }
        }
    }, [user, userData, loading, router]);

    // Real-time listener for introductions
    useEffect(() => {
        if (!user || userData?.role !== 'admin') return;

        const q = query(collection(db!, "introductions"), orderBy("updatedAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const intros = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Introduction));
            setIntroductions(intros);
        });

        const usersUnsubscribe = onSnapshot(collection(db!, "users"), (snap) => {
            setUsersCount(snap.size);
        });

        return () => {
            unsubscribe();
            usersUnsubscribe();
        };
    }, [user, userData]);

    if (loading || !userData || userData.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
                    <div className="text-rose-300 font-medium animate-pulse">Accessing Admin Panel...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">
                            <SplitText
                                text="Admin Dashboard"
                                className="text-3xl font-bold text-white inline-block"
                                delay={0.1}
                            />
                        </h1>
                        <p className="text-slate-400">Overview and management of the AroAce Midgard platform.</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/10">
                    <AdminOverview introductions={introductions} usersCount={usersCount} />
                </div>
            </div>
        </div>
    );
}
