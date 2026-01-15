"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";
import { MatchCard, MatchCardVariant } from "./match-card";
import { Users, Heart, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Introduction } from "@/types";
import { BrowseFilters, FilterState } from "@/components/browse/browse-filters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface MatchListProps {
    type: LikeType;
    mode: "requests" | "matches" | "sent";
}

export function MatchList({ type, mode }: MatchListProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter State
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

    const fetchData = async () => {
        if (!user) return;
        if (items.length === 0) setLoading(true);

        try {
            if (mode === 'sent') {
                const [outgoingLikes, matches] = await Promise.all([
                    LikesService.getOutgoingLikes(user.uid),
                    LikesService.getMatches(user.uid)
                ]);

                const relevantLikes = outgoingLikes.filter(l => l.type === type);

                // Identify and cleanup ghost likes (profiles that no longer exist)
                const validLikes = relevantLikes.filter(l => !!l.targetProfile);
                const ghostLikes = relevantLikes.filter(l => !l.targetProfile);

                if (ghostLikes.length > 0) {
                    ghostLikes.forEach(l => {
                        LikesService.rejectLike(user.uid, l.toUserId);
                    });
                }

                setItems(validLikes.map(l => ({
                    id: l.likeId,
                    profile: l.targetProfile,
                    type: l.type,
                    userId: l.toUserId
                })));

            } else {
                const [incomingLikes, matches] = await Promise.all([
                    LikesService.getIncomingLikes(user.uid),
                    LikesService.getMatches(user.uid)
                ]);

                if (mode === "requests") {
                    const relevantLikes = incomingLikes.filter(l => l.type === type);
                    const unmatchedLikes = relevantLikes.filter(like => {
                        const hasMatch = matches.some(m => m.otherUserId === like.fromUserId);
                        return !hasMatch;
                    });

                    // Identify and cleanup ghost likes
                    const validLikes = unmatchedLikes.filter(l => !!l.likerProfile);
                    const ghostLikes = unmatchedLikes.filter(l => !l.likerProfile);

                    if (ghostLikes.length > 0) {
                        ghostLikes.forEach(l => {
                            LikesService.rejectLike(l.fromUserId, user.uid);
                        });
                    }

                    setItems(validLikes.map(l => ({
                        id: l.likeId,
                        profile: l.likerProfile,
                        type: l.type,
                        userId: l.fromUserId
                    })));

                } else {
                    const relevantMatches = matches.filter(m => m.type === type);

                    // Filter matches with valid profiles
                    const validMatches = relevantMatches.filter(m => !!m.otherProfile);

                    setItems(validMatches.map(m => ({
                        id: m.matchId,
                        profile: m.otherProfile,
                        type: m.type,
                        userId: m.otherUserId
                    })));
                }
            }
        } catch (error) {
            console.error("Error fetching match data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        const unsubscribe = LikesService.listenToMatchmaking(user.uid, () => {
            fetchData();
        });
        fetchData();
        return () => unsubscribe();
    }, [user, type, mode]);

    // Helper: Calculate age from DOB
    const getAge = (dob?: string) => {
        if (!dob) return 0;
        const diff_ms = Date.now() - new Date(dob).getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    // Filter Logic
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const intro = item.profile as Introduction;
            if (!intro) return false;

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

            // 5. Sex Desire
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
    }, [items, filters]);

    // Pagination Logic
    const pageSize = 30;
    const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredItems.slice(start, start + pageSize);
    }, [filteredItems, currentPage]);

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
                className="rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 disabled:opacity-20 h-10 w-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all shadow-white/5"
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
                className="rounded-full border border-white/40 bg-white/10 text-white hover:bg-white/20 hover:border-white/60 disabled:opacity-20 h-10 w-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm transition-all shadow-white/5"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );

    const handlePass = async (targetUserId: string) => {
        if (!user) return;
        const isSent = mode === 'sent';
        const message = isSent
            ? "Are you sure you want to cancel this request?"
            : "Are you sure you want to pass? This request will be removed.";

        if (confirm(message)) {
            setItems(prev => prev.filter(i => i.userId !== targetUserId));
            if (isSent) {
                await LikesService.rejectLike(user.uid, targetUserId);
            } else {
                await LikesService.rejectLike(targetUserId, user.uid);
            }
        }
    };

    const getVariant = (): MatchCardVariant => {
        if (mode === 'sent') return 'sent-requests';
        if (mode === 'requests') {
            return type === 'friend' ? 'friend-requests' : 'partner-requests';
        }
        return type === 'friend' ? 'friend-matches' : 'partner-matches';
    };

    if (loading && items.length === 0) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden w-full flex justify-center mb-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10">
                                <Filter className="w-4 h-4 mr-2 text-purple-400" /> Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-black border-r border-white/10 text-slate-200 p-0">
                            <div className="sr-only">
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Adjust your search criteria</SheetDescription>
                            </div>
                            <div className="py-2">
                                <BrowseFilters
                                    filters={filters}
                                    setFilters={setFilters}
                                    totalResults={filteredItems.length}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-80 shrink-0 sticky top-24">
                    <BrowseFilters
                        filters={filters}
                        setFilters={setFilters}
                        totalResults={filteredItems.length}
                    />
                </div>

                <div className="flex-1 w-full">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 backdrop-blur-md rounded-xl border border-dashed border-white/10">
                            {type === 'friend' ? <Users className="w-12 h-12 mx-auto text-slate-500 mb-4 opacity-20" /> : <Heart className="w-12 h-12 mx-auto text-slate-500 mb-4 opacity-20" />}
                            <h3 className="text-slate-400 font-medium text-lg">
                                {items.length === 0
                                    ? (mode === 'requests' ? 'No pending requests' : mode === 'sent' ? 'No sent requests' : 'No matches yet')
                                    : 'No results match your filters'
                                }
                            </h3>
                            <p className="text-slate-500 mt-1 px-4">
                                {items.length === 0
                                    ? (mode === 'requests' ? `People who like you as a ${type === 'friend' ? 'friend' : 'partner'} will appear here.` : `Your ${type === 'friend' ? 'friendship' : 'partnership'} activity will show up here.`)
                                    : 'Try adjusting your search or filters.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Top Pagination */}
                            <PaginationControls />

                            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {currentItems.map((item) => (
                                    <MatchCard
                                        key={item.id}
                                        profile={item.profile as Introduction}
                                        type={type}
                                        isMatch={mode === 'matches'}
                                        isSent={mode === 'sent'}
                                        onPass={() => handlePass(item.userId)}
                                        variant={getVariant()}
                                    />
                                ))}
                            </div>

                            {/* Bottom Pagination */}
                            <PaginationControls />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";
