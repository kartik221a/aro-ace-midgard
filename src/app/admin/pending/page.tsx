"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminGuard } from "@/components/layout/admin-guard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Filter } from "lucide-react";
import Link from "next/link";
import { AdminIntroductionList } from "@/components/admin/admin-introduction-list";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
// Import Introduction and status type
import { Introduction, IntroductionStatus } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { getDoc } from "firebase/firestore";
import { AdminIntroductionFilters, IntroFilterState } from "@/components/admin/admin-introduction-filters";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PaginationControls } from "@/components/ui/pagination-controls";

import { SplitText } from "@/components/ui/reactbits/split-text";

export default function AdminPendingPage() {
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const { user } = useAuth();

    const [filters, setFilters] = useState<IntroFilterState>({
        searchTerm: "",
        genders: [],
        intents: [],
    });

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const q = query(
            collection(db!, "introductions"),
            where("status", "==", "pending")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIntroductions(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as Introduction)));
        });
        return () => unsubscribe();
    }, []);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const filteredIntroductions = useMemo(() => {
        return introductions.filter(intro => {
            // 1. Search Term (Name)
            if (filters.searchTerm) {
                const name = (intro.pendingUpdate?.basicInfo?.name || intro.basicInfo.name).toLowerCase();
                if (!name.includes(filters.searchTerm.toLowerCase())) return false;
            }

            // 2. Intents
            if (filters.intents.length > 0) {
                const intent = intro.pendingUpdate?.lookingFor?.intent || intro.lookingFor.intent;
                if (!filters.intents.includes(intent)) return false;
            }

            // 3. Gender
            if (filters.genders.length > 0) {
                const genders = intro.pendingUpdate?.basicInfo?.gender || intro.basicInfo.gender;
                const hasMatch = genders.some(g => filters.genders.includes(g));
                if (!hasMatch) return false;
            }

            return true;
        });
    }, [introductions, filters]);

    // Pagination Logic
    const pageSize = 30;
    const totalPages = Math.ceil(filteredIntroductions.length / pageSize) || 1;
    const currentIntroductions = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredIntroductions.slice(start, start + pageSize);
    }, [filteredIntroductions, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleUpdateStatus = async (uid: string, status: IntroductionStatus, reason?: string) => {
        if (!user) return;

        const updateData: any = {
            status,
            updatedAt: serverTimestamp(),
        };

        if (status === 'rejected') {
            updateData.rejectionReason = reason || "";
            updateData.rejectedBy = user.uid;
            updateData.reviewedAt = Date.now();
        } else if (status === 'approved') {
            updateData.rejectionReason = null;
            updateData.rejectedBy = null;
            updateData.approvedBy = user.uid;
            updateData.reviewedAt = Date.now();
        }

        try {
            const docRef = doc(db!, "introductions", uid);
            if (status === 'approved') {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const intro = docSnap.data() as Introduction;
                    if (intro.pendingUpdate) {
                        // Merge pendingUpdate into root
                        const { pendingUpdate, ...rest } = intro;
                        const mergedData = {
                            ...rest,
                            ...pendingUpdate,
                            status: 'approved' as IntroductionStatus,
                            approvedBy: user.uid,
                            reviewedAt: Date.now(),
                            updatedAt: serverTimestamp(),
                            pendingUpdate: null, // Clear it
                            rejectionReason: null,
                            rejectedBy: null
                        };
                        await updateDoc(docRef, mergedData);
                        return;
                    }
                }
            }

            // Fallback for simple status updates or rejections
            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen pt-24 pb-20 px-6 md:px-10 lg:px-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" asChild className="rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/40 hover:border-white/60 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md">
                                <Link href="/admin"><ChevronLeft className="h-5 w-5" /></Link>
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight">
                                <SplitText
                                    text="Pending Requests"
                                    className="text-3xl font-bold text-white inline-block"
                                    delay={0.1}
                                />
                            </h1>
                        </div>

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
                                        <SheetDescription>Adjust search criteria</SheetDescription>
                                    </div>
                                    <div className="py-4">
                                        <AdminIntroductionFilters
                                            filters={filters}
                                            setFilters={setFilters}
                                            totalResults={filteredIntroductions.length}
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
                                <AdminIntroductionFilters
                                    filters={filters}
                                    setFilters={setFilters}
                                    totalResults={filteredIntroductions.length}
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full min-w-0 space-y-6">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                            <AdminIntroductionList
                                introductions={currentIntroductions}
                                type="pending"
                                onUpdateStatus={handleUpdateStatus}
                            />
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
