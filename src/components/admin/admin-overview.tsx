import Link from "next/link";
import { Introduction } from "@/types";
import { Users, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";

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
        <div className="space-y-12">
            <h2 className="text-xl font-bold text-slate-200">Dashboard Overview</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users">
                    <SpotlightCard className="h-full border border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors" spotlightColor="rgba(99, 102, 241, 0.2)">
                        <div className="p-8 md:p-10">
                            <div className="flex flex-row items-center justify-between pb-2">
                                <div className="text-sm font-medium text-slate-400">Total Users</div>
                                <Users className="h-4 w-4 text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white">{usersCount}</div>
                                <p className="text-xs text-slate-500">Registered platform users</p>
                            </div>
                        </div>
                    </SpotlightCard>
                </Link>

                <Link href="/admin/pending">
                    <SpotlightCard className="h-full border border-yellow-500/20 bg-yellow-500/5 rounded-2xl hover:bg-yellow-500/10 transition-colors" spotlightColor="rgba(234, 179, 8, 0.2)">
                        <div className="p-8 md:p-10">
                            {pendingCount > 0 && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            )}
                            <div className="flex flex-row items-center justify-between pb-2">
                                <div className="text-sm font-medium text-slate-400">Pending Requests</div>
                                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-yellow-100">{pendingCount}</div>
                                <p className="text-xs text-slate-500">Awaiting moderation</p>
                            </div>
                        </div>
                    </SpotlightCard>
                </Link>

                <Link href="/admin/approved">
                    <SpotlightCard className="h-full border border-green-500/20 bg-green-500/5 rounded-2xl hover:bg-green-500/10 transition-colors" spotlightColor="rgba(34, 197, 94, 0.2)">
                        <div className="p-8 md:p-10">
                            <div className="flex flex-row items-center justify-between pb-2">
                                <div className="text-sm font-medium text-slate-400">Approved</div>
                                <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-100">{approvedCount}</div>
                                <p className="text-xs text-slate-500">Total approved profiles</p>
                            </div>
                        </div>
                    </SpotlightCard>
                </Link>

                <Link href="/admin/rejected">
                    <SpotlightCard className="h-full border border-red-500/20 bg-red-500/5 rounded-2xl hover:bg-red-500/10 transition-colors" spotlightColor="rgba(239, 68, 68, 0.2)">
                        <div className="p-8 md:p-10">
                            <div className="flex flex-row items-center justify-between pb-2">
                                <div className="text-sm font-medium text-slate-400">Rejected</div>
                                <XCircle className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-100">{rejectedCount}</div>
                                <p className="text-xs text-slate-500">Total rejected profiles</p>
                            </div>
                        </div>
                    </SpotlightCard>
                </Link>
            </div>

            <div className="grid gap-6">
                <SpotlightCard className="col-span-1 bg-white/5 border border-white/10 rounded-2xl" spotlightColor="rgba(255, 255, 255, 0.1)">
                    <div className="p-8 md:p-10">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            <h3 className="font-bold text-lg text-white">Recent Activity Log</h3>
                        </div>

                        <div className="space-y-4">
                            {introductions.slice(0, 5).map((intro, index) => {
                                const updatedAt = intro.updatedAt ? new Date(
                                    // @ts-ignore - handling firebase timestamp vs number
                                    (intro.updatedAt as any)?.toMillis ? (intro.updatedAt as any).toMillis() : intro.updatedAt
                                ) : new Date();

                                return (
                                    <div key={intro.uid} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${intro.status === 'approved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                                                intro.status === 'rejected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                    'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium leading-none mb-1 text-slate-200">
                                                    {intro.basicInfo.name}
                                                    <span className="text-slate-500 font-normal"> was </span>
                                                    <span className={`capitalize font-bold ${intro.status === 'approved' ? 'text-green-400' :
                                                        intro.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                                                        }`}>{intro.status}</span>
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {updatedAt.toLocaleString()}
                                                    {intro.status === 'rejected' && intro.rejectionReason && (
                                                        <span className="ml-2 text-red-400/80">• Reason: {intro.rejectionReason}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-600 text-right">
                                            {intro.status === 'approved' && intro.approvedBy && <div>by {intro.approvedBy}</div>}
                                            {intro.status === 'rejected' && intro.rejectedBy && <div>by {intro.rejectedBy}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                            {introductions.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No activity recorded yet.</p>}
                        </div>
                    </div>
                </SpotlightCard>
            </div>
        </div>
    );
}
