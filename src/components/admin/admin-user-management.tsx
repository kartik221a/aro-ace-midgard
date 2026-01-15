import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Shield, UserX, ExternalLink } from "lucide-react";
import Link from "next/link";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import MagnetButton from "@/components/ui/reactbits/magnet-button";

export function AdminUserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            if (db) {
                const querySnapshot = await getDocs(collection(db, "users"));
                const userList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserData));
                setUsers(userList);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="text-slate-400 animate-pulse">Loading users...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-200">User Management</h2>
            <div className="grid gap-4">
                {users.map((user, index) => (
                    <SpotlightCard key={user.uid} className={`p-4 rounded-xl border transition-all ${user.isBanned ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10"}`} spotlightColor={user.isBanned ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.1)"}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold relative border ${user.isBanned ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-white/10 text-white border-white/20"
                                    }`}>
                                    {(user.displayName || user.email || "?")[0].toUpperCase()}
                                    {user.isBanned && (
                                        <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 border border-white/20">
                                            <UserX className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-white">{user.displayName || "Unknown User"}</p>
                                        {user.isBanned && <Badge variant="destructive" className="h-5 text-[10px] px-1 bg-red-500 text-white">BANNED</Badge>}
                                    </div>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                    {user.isBanned && user.banReason && <p className="text-xs text-red-400 mt-1">Reason: {user.banReason}</p>}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 justify-end w-full md:w-auto">
                                {user.role === 'admin' ? (
                                    <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 bg-indigo-500/20"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-white/10 text-slate-300 hover:bg-white/20">User</Badge>
                                )}

                                <Link href={`/u/${user.uid}`} target="_blank">
                                    <MagnetButton className="h-8 px-3 rounded-lg border border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center justify-center" strength={10}>
                                        <ExternalLink className="w-3 h-3 mr-2" />
                                        View Profile
                                    </MagnetButton>
                                </Link>
                            </div>
                        </div>
                    </SpotlightCard>
                ))}
            </div>
        </div>
    );
}
