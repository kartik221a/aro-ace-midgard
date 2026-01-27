import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, doc, writeBatch, query, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Shield, UserX, ExternalLink, Trash2, AlertTriangle, Filter } from "lucide-react";
import Link from "next/link";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminUserFilters, UserFilterState } from "./admin-user-filters";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { cn } from "@/lib/utils";

export function AdminUserManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmUid, setDeleteConfirmUid] = useState<string | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");

    const [filters, setFilters] = useState<UserFilterState>({
        searchTerm: "",
        role: "all",
        status: "all",
    });

    const [currentPage, setCurrentPage] = useState(1);

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

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // 1. Search Term
            if (filters.searchTerm) {
                const search = filters.searchTerm.toLowerCase();
                const nameMatch = user.displayName?.toLowerCase().includes(search);
                const emailMatch = user.email?.toLowerCase().includes(search);
                if (!nameMatch && !emailMatch) return false;
            }

            // 2. Role
            if (filters.role !== "all" && user.role !== filters.role) {
                return false;
            }

            // 3. Status
            if (filters.status !== "all") {
                const isBanned = !!user.isBanned;
                if (filters.status === "active" && isBanned) return false;
                if (filters.status === "banned" && !isBanned) return false;
            }

            return true;
        });
    }, [users, filters]);

    // Pagination Logic
    const pageSize = 30;
    const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
    const currentUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUsers.slice(start, start + pageSize);
    }, [filteredUsers, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading) return <div className="text-slate-400 animate-pulse">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-200">User Management</h2>

                {/* Mobile Filter Toggle */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10">
                                <Filter className="w-4 h-4 mr-2 text-purple-400" /> Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-black border-r border-white/10 text-slate-200">
                            <div className="sr-only">
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Adjust user filters</SheetDescription>
                            </div>
                            <div className="py-4">
                                <AdminUserFilters
                                    filters={filters}
                                    setFilters={setFilters}
                                    totalResults={filteredUsers.length}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-72 shrink-0 sticky top-24">
                    <div className="glass p-6 rounded-xl border border-white/10 bg-[#0f111a]/50">
                        <AdminUserFilters
                            filters={filters}
                            setFilters={setFilters}
                            totalResults={filteredUsers.length}
                        />
                    </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                    {filteredUsers.length > 0 ? (
                        <>
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />

                            {currentUsers.map((user, index) => (
                                <SpotlightCard key={user.uid} className={`rounded-xl border transition-all ${user.isBanned ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10"}`} spotlightColor={user.isBanned ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.1)"}>
                                    <div className="p-5 md:p-6">
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

                                                <Link href={`/profile/${user.username || user.uid}`} target="_blank">
                                                    <MagnetButton className="h-8 px-3 rounded-lg border border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center justify-center" strength={10}>
                                                        <ExternalLink className="w-3 h-3 mr-2" />
                                                        View Profile
                                                    </MagnetButton>
                                                </Link>

                                                <MagnetButton
                                                    className="h-8 px-3 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 text-xs flex items-center justify-center"
                                                    onClick={() => setDeleteConfirmUid(user.uid)}
                                                    strength={10}
                                                >
                                                    <Trash2 className="w-3 h-3 mr-2" />
                                                    Delete
                                                </MagnetButton>
                                            </div>
                                        </div>
                                    </div>
                                </SpotlightCard>
                            ))}

                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    ) : (
                        <div className="text-center py-12 border-dashed border border-white/10 bg-white/5 rounded-2xl text-slate-500">
                            No users match your filters.
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteConfirmUid} onOpenChange={(open) => !open && setDeleteConfirmUid(null)}>
                <DialogContent className="bg-[#0f111a] border-white/10 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                            CRITICAL: Delete User?
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            This action is permanent. It will delete the user record, profile, all likes, and all matches.
                            The user will be effectively wiped from the platform.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="confirmText" className="text-slate-300">
                                Type <span className="text-rose-400 font-bold">delete this user</span> to confirm:
                            </Label>
                            <Input
                                id="confirmText"
                                className="bg-white/5 border-white/10 text-white focus:border-rose-500/50"
                                placeholder="Type here..."
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDeleteConfirmUid(null)} className="text-slate-400 hover:text-white">Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteConfirmText !== "delete this user" || isDeleting}
                            onClick={async () => {
                                if (!deleteConfirmUid || !db) return;
                                setIsDeleting(true);
                                try {
                                    const uid = deleteConfirmUid;

                                    // 0. Fetch user's profile to get image URLs for Cloudinary cleanup
                                    const introRef = doc(db, "introductions", uid);
                                    const introSnap = await getDoc(introRef);
                                    if (introSnap.exists()) {
                                        const introData = introSnap.data();
                                        const imageUrls: string[] = [];

                                        if (introData.images?.profileUrl) imageUrls.push(introData.images.profileUrl);
                                        if (introData.images?.coverUrl) imageUrls.push(introData.images.coverUrl);
                                        if (introData.images?.gallery && Array.isArray(introData.images.gallery)) {
                                            imageUrls.push(...introData.images.gallery);
                                        }

                                        if (imageUrls.length > 0) {
                                            console.log(`[Admin] Cleaning up ${imageUrls.length} images from Cloudinary...`);
                                            try {
                                                await fetch("/api/cloudinary/delete", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ urls: imageUrls }),
                                                });
                                            } catch (cloudinaryError) {
                                                console.error("[Admin] Cloudinary cleanup failed:", cloudinaryError);
                                                // We continue anyway to ensure the user is deleted from DB
                                            }
                                        }
                                    }

                                    const batch = writeBatch(db);

                                    // 1. Delete basic user record
                                    batch.delete(doc(db, "users", uid));

                                    // 2. Delete introduction profile
                                    batch.delete(introRef);

                                    // 3. Delete likes (outgoing)
                                    const outLikes = await getDocs(query(collection(db, "likes"), where("fromUserId", "==", uid)));
                                    outLikes.forEach(d => batch.delete(d.ref));

                                    // 4. Delete likes (incoming)
                                    const inLikes = await getDocs(query(collection(db, "likes"), where("toUserId", "==", uid)));
                                    inLikes.forEach(d => batch.delete(d.ref));

                                    // 5. Delete matches
                                    const matches = await getDocs(query(collection(db, "matches"), where(`users.${uid}`, "==", true)));
                                    matches.forEach(d => batch.delete(d.ref));

                                    await batch.commit();

                                    setUsers(prev => prev.filter(u => u.uid !== uid));
                                    setDeleteConfirmUid(null);
                                    setDeleteConfirmText("");
                                    alert("User and all associated data deleted successfully.");
                                } catch (error) {
                                    console.error("Deletion failed:", error);
                                    alert("Failed to delete user. Check console for details.");
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? "Deleting..." : "Confirm Deletion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
