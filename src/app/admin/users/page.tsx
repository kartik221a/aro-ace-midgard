"use client";

import { AdminUserManagement } from "@/components/admin/admin-user-management";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <div className="container py-10 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin"><ChevronLeft className="h-4 w-4" /></Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                </div>
                <AdminUserManagement />
            </div>
        </AdminGuard>
    );
}
