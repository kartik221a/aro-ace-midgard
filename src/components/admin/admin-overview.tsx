import Link from "next/link";
// ... imports

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Introduction } from "@/types";
import { Users, FileText, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface AdminOverviewProps {
    introductions: Introduction[];
    usersCount: number;
}

export function AdminOverview({ introductions, usersCount }: AdminOverviewProps) {
    const totalIntros = introductions.length;
    const pendingCount = introductions.filter(i => i.status === "pending").length;
    const approvedCount = introductions.filter(i => i.status === "approved").length;
    const rejectedCount = introductions.filter(i => i.status === "rejected").length;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{usersCount}</div>
                            <p className="text-xs text-muted-foreground">Registered platform users</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/pending">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/approved">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvedCount}</div>
                            <p className="text-xs text-muted-foreground">Total approved profiles</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/rejected">
                    <Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rejectedCount}</div>
                            <p className="text-xs text-muted-foreground">Total rejected profiles</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {introductions.slice(0, 5).map(intro => {
                                const updatedAt = intro.updatedAt ? new Date(
                                    // @ts-ignore - handling firebase timestamp vs number
                                    (intro.updatedAt as any)?.toMillis ? (intro.updatedAt as any).toMillis() : intro.updatedAt
                                ) : new Date();

                                return (
                                    <div key={intro.uid} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${intro.status === 'approved' ? 'bg-green-500' :
                                                intro.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium leading-none mb-1">
                                                    {intro.basicInfo.name}
                                                    <span className="text-muted-foreground font-normal"> was </span>
                                                    <span className={`capitalize font-semibold ${intro.status === 'approved' ? 'text-green-600' :
                                                        intro.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                                                        }`}>{intro.status}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {updatedAt.toLocaleString()}
                                                    {intro.status === 'rejected' && intro.rejectionReason && (
                                                        <span className="ml-2 text-red-400">• Reason: {intro.rejectionReason}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right">
                                            {intro.status === 'approved' && intro.approvedBy && <div>by {intro.approvedBy}</div>}
                                            {intro.status === 'rejected' && intro.rejectedBy && <div>by {intro.rejectedBy}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                            {introductions.length === 0 && <p className="text-sm text-slate-500">No activity recorded yet.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
