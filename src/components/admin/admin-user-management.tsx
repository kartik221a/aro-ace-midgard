import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserX, ExternalLink } from "lucide-react";
import Link from "next/link";

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

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <div className="grid gap-4">
                {users.map(user => (
                    <Card key={user.uid} className={user.isBanned ? "bg-red-50 border-red-200" : ""}>
                        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold relative ${user.isBanned ? "bg-red-200 text-red-700" : "bg-rose-100 text-rose-600"
                                    }`}>
                                    {(user.displayName || user.email || "?")[0].toUpperCase()}
                                    {user.isBanned && (
                                        <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 border-2 border-white">
                                            <UserX className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{user.displayName || "Unknown User"}</p>
                                        {user.isBanned && <Badge variant="destructive" className="h-5 text-[10px] px-1">BANNED</Badge>}
                                    </div>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    {user.isBanned && user.banReason && <p className="text-xs text-red-600 mt-1">Reason: {user.banReason}</p>}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto">
                                {user.role === 'admin' ? (
                                    <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
                                ) : (
                                    <Badge variant="secondary">User</Badge>
                                )}

                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/u/${user.uid}`} target="_blank">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Profile
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
