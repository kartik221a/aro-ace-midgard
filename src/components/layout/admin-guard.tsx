
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (userData && userData.role !== "admin") {
                router.push("/dashboard");
            }
        }
    }, [user, userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Verifying privileges...</div>
            </div>
        );
    }

    if (!user || (userData && userData.role !== "admin")) {
        return null;
    }

    return <>{children}</>;
}
