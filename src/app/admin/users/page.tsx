"use client";

import { AdminUserManagement } from "@/components/admin/admin-user-management";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { SplitText } from "@/components/ui/reactbits/split-text";

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild className="text-slate-400 hover:text-white hover:bg-white/10">
                            <Link href="/admin"><ChevronLeft className="h-5 w-5" /></Link>
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            <SplitText
                                text="User Management"
                                className="text-3xl font-bold text-white inline-block"
                                delay={0.1}
                            />
                        </h1>
                    </div>
                    <AdminUserManagement />
                </div>
            </div>
        </AdminGuard>
    );
}
