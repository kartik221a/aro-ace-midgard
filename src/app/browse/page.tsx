"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { cn } from "@/lib/utils";
import { SectionDivider } from "@/components/ui/section-divider";
import { IntroductionCard } from "@/components/introduction-card";
import { BrowseFilters, FilterState } from "@/components/browse/browse-filters";
import { Button } from "@/components/ui/button";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";
import GradientText from "@/components/GradientText";
import { motion, AnimatePresence } from "framer-motion";

export default function BrowsePage() {
    const { user } = useAuth();
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [loading, setLoading] = useState(true);
    const [myLikes, setMyLikes] = useState<Record<string, LikeType>>({});
    const [myMatches, setMyMatches] = useState<Record<string, LikeType>>({});
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (user) {
            const unsubLikes = LikesService.listenToMyLikes(user.uid, (likes) => {
                setMyLikes(likes);
            });
            const unsubMatches = LikesService.listenToMyMatches(user.uid, (matches) => {
                setMyMatches(matches);
            });
            return () => {
                unsubLikes();
                unsubMatches();
            };
        } else {
            setMyLikes({});
            setMyMatches({});
        }
    }, [user]);

    const [filters, setFilters] = useState<FilterState>({
        searchTerm: "",
        ageRange: [18, 100],
        intents: [],
        sexDesire: [],
        romanceDesire: [],
        genders: [],
        longDistance: [],
        qpr: [],
        polyamory: [],
        marriage: []
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    useEffect(() => {
        const fetchIntroductions = async () => {
            try {
                if (db) {
                    const q = query(
                        collection(db, "introductions"),
                        where("status", "==", "approved"),
                        orderBy("updatedAt", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    const list = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Introduction));
                    setIntroductions(list);
                }
            } catch (error) {
                console.error("Error fetching introductions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchIntroductions();
    }, []);

    // Helper: Calculate age from DOB
    const getAge = (dob?: string) => {
        if (!dob) return 0;
        const diff_ms = Date.now() - new Date(dob).getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    // Filter Logic
    const filteredIntroductions = useMemo(() => {
        return introductions.filter(intro => {
            // 0. Exclude self and already liked profiles
            if (user && intro.uid === user.uid) {
                return false;
            }
            if (myLikes[intro.uid]) {
                return false;
            }

            // 1. Search Term (Name)
            if (filters.searchTerm && !intro.basicInfo?.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
                return false;
            }

            // 2. Age Range
            const age = getAge(intro.basicInfo?.dob);
            if (age < filters.ageRange[0] || age > filters.ageRange[1]) {
                return false;
            }

            // 3. Intents (Looking For)
            if (filters.intents.length > 0 && !filters.intents.includes(intro.lookingFor.intent)) {
                return false;
            }

            // 4. Gender (Array overlap)
            if (filters.genders.length > 0) {
                const hasMatch = intro.basicInfo?.gender.some(g => filters.genders.includes(g));
                if (!hasMatch) return false;
            }

            // 5. Sex Desire (Exact match on personal desire)
            if (filters.sexDesire.length > 0) {
                if (!intro.lookingFor?.personal?.sexDesire || !filters.sexDesire.includes(intro.lookingFor.personal.sexDesire)) {
                    return false;
                }
            }

            // 6. Romance Desire
            if (filters.romanceDesire.length > 0) {
                if (!intro.lookingFor?.personal?.romanceDesire || !filters.romanceDesire.includes(intro.lookingFor.personal.romanceDesire)) {
                    return false;
                }
            }

            // 7. Long Distance
            if (filters.longDistance.length > 0) {
                if (!intro.lookingFor?.personal?.longDistance || !filters.longDistance.includes(intro.lookingFor.personal.longDistance)) {
                    return false;
                }
            }

            // 8. QPR
            if (filters.qpr.length > 0) {
                if (!intro.lookingFor?.personal?.qpr || !filters.qpr.includes(intro.lookingFor.personal.qpr)) {
                    return false;
                }
            }

            // 9. Polyamory
            if (filters.polyamory.length > 0) {
                if (!intro.lookingFor?.personal?.polyamory || !filters.polyamory.includes(intro.lookingFor.personal.polyamory)) {
                    return false;
                }
            }

            // 10. Marriage
            if (filters.marriage.length > 0) {
                if (!intro.lookingFor?.personal?.marriage || !filters.marriage.includes(intro.lookingFor.personal.marriage)) {
                    return false;
                }
            }

            return true;
        });
    }, [introductions, filters, myLikes]);

    // Pagination Logic
    const pageSize = 30;
    const totalPages = Math.ceil(filteredIntroductions.length / pageSize) || 1;
    const currentCards = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredIntroductions.slice(start, start + pageSize);
    }, [filteredIntroductions, currentPage]);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    const PaginationControls = () => (
        <div className="flex flex-wrap items-center justify-center gap-2 py-4">
            <Button
                variant="outline"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 disabled:opacity-20 h-10 w-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                {getPageNumbers().map((p, i) => (
                    typeof p === "number" ? (
                        <button
                            key={i}
                            onClick={() => goToPage(p)}
                            className={cn(
                                "min-w-[32px] h-8 px-2 rounded-full text-sm font-bold transition-all duration-300",
                                currentPage === p
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40"
                                    : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                            )}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={i} className="text-slate-600 px-1 select-none">...</span>
                    )
                ))}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 disabled:opacity-20 h-10 w-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="container mx-auto">
                <div className="flex flex-col items-center text-center mb-12 gap-4">
                    <div className="w-full">
                        <GradientText
                            colors={["#a855f7", "#d946ef", "#ec4899"]} // Purple to Fuchsia to Pink
                            animationSpeed={3}
                            showBorder={false}
                            className="text-4xl md:text-5xl font-bold tracking-tight"
                        >
                            Browse Introductions
                        </GradientText>
                        <p className="text-slate-400 mt-4 text-lg">Find new friends and potential partners in the community.</p>
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
                                    <SheetDescription>Adjust your search criteria</SheetDescription>
                                </div>
                                <div className="py-4">
                                    <BrowseFilters
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
                    <div className="hidden lg:block w-80 shrink-0 sticky top-24">
                        <div className="glass p-6 rounded-xl border border-white/10">
                            <BrowseFilters
                                filters={filters}
                                setFilters={setFilters}
                                totalResults={filteredIntroductions.length}
                            />
                        </div>
                    </div>

                    {/* Profile View Area */}
                    <div className="flex-1 w-full min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-96 bg-white/5 rounded-xl animate-pulse border border-white/5" />
                                ))}
                            </div>
                        ) : filteredIntroductions.length > 0 ? (
                            <div className="space-y-8">
                                {/* Top Pagination */}
                                <PaginationControls />

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {currentCards.map((intro) => (
                                            <motion.div
                                                key={intro.uid}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <IntroductionCard
                                                    introduction={intro}
                                                    myLikeStatus={myLikes[intro.uid] || null}
                                                    matchStatus={myMatches[intro.uid] || null}
                                                    onToggleLike={(type) => {
                                                        if (user) {
                                                            LikesService.toggleLike(user.uid, intro.uid, type);
                                                        } else {
                                                            alert("Please sign in to like!");
                                                        }
                                                    }}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Bottom Pagination */}
                                <PaginationControls />
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 backdrop-blur-sm">
                                <h3 className="text-lg font-medium text-slate-200 mb-2">No matches found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                                    Try adjusting your filters to see more results.
                                </p>
                                <Button
                                    variant="link"
                                    className="text-purple-400 hover:text-purple-300"
                                    onClick={() => setFilters({
                                        searchTerm: "",
                                        ageRange: [18, 100],
                                        intents: [],
                                        sexDesire: [],
                                        romanceDesire: [],
                                        genders: [],
                                        longDistance: [],
                                        qpr: [],
                                        polyamory: [],
                                        marriage: []
                                    })}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
