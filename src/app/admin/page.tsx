"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { AdminOverview } from "@/components/admin/admin-overview";
import { Loader2 } from "lucide-react";

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
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg font-medium text-muted-foreground">Loading Admin Panel...</span>
            </div>
        );
    }

    return (
        <div className="container py-8 md:py-10 space-y-8 px-4 md:px-8">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-indigo-600">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Overview and management of the AroAce Midgard platform.</p>
                </div>
            </div>

            <AdminOverview introductions={introductions} usersCount={usersCount} />
        </div>
    );
}
