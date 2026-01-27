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
import { Filter, ChevronLeft, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";
import GradientText from "@/components/GradientText";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import Orb from "@/components/Orb";
import Link from "next/link";

export default function BrowsePage() {
    const { user } = useAuth();
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [loading, setLoading] = useState(true);
    const [myLikes, setMyLikes] = useState<Record<string, LikeType>>({});
    const [myMatches, setMyMatches] = useState<Record<string, LikeType>>({});
    const [myProfile, setMyProfile] = useState<Introduction | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (user) {
            const unsubLikes = LikesService.listenToMyLikes(user.uid, (likes) => {
                setMyLikes(likes);
            });
            const unsubMatches = LikesService.listenToMyMatches(user.uid, (matches) => {
                setMyMatches(matches);
            });

            // Check if user has a profile
            const checkProfile = async () => {
                if (db) {
                    const docSnap = await getDoc(doc(db, "introductions", user.uid));
                    if (docSnap.exists()) {
                        const data = docSnap.data() as Introduction;
                        setMyProfile(data);
                        setHasProfile(true);
                    } else {
                        setMyProfile(null);
                        setHasProfile(false);
                    }
                }
            };
            checkProfile();

            return () => {
                unsubLikes();
                unsubMatches();
            };
        } else {
            setMyLikes({});
            setMyMatches({});
            setHasProfile(false);
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
                const desire = intro.lookingFor?.personal?.sexDesire;
                if (!desire || !filters.sexDesire.includes(desire)) {
                    return false;
                }
            }

            // 6. Romance Desire
            if (filters.romanceDesire.length > 0) {
                const desire = intro.lookingFor?.personal?.romanceDesire;
                if (!desire || !filters.romanceDesire.includes(desire)) {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    if (!user || loading || hasProfile === null) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-medium animate-pulse">Scanning the cosmos...</p>
                </div>
            </div>
        );
    }

    if (hasProfile === false) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Orb hue={290} hoverIntensity={0.5} rotateOnHover={true} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl w-full text-center space-y-8 glass p-8 md:p-12 rounded-3xl border border-white/10 relative z-10 backdrop-blur-2xl shadow-2xl shadow-purple-500/10"
                >
                    <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-12">
                        <Filter className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-4">
                        <GradientText
                            colors={["#a855f7", "#d946ef", "#ec4899"]}
                            animationSpeed={3}
                            showBorder={false}
                            className="text-3xl md:text-4xl font-bold tracking-tight"
                        >
                            Profile Required
                        </GradientText>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            To maintain a safe and committed community, you must create your own introduction before you can browse others.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button
                            asChild
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-xl shadow-purple-900/40 transition-all active:scale-[0.98]"
                        >
                            <Link href="/dashboard">Create Your Profile</Link>
                        </Button>
                        <p className="text-sm text-slate-500 mt-4 italic">It only takes a few minutes to connect with the cosmos.</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Restriction for first-time pending profiles
    const isFirstTimePending = myProfile?.status === "pending" && !myProfile?.pendingUpdate;

    if (isFirstTimePending) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Orb hue={260} hoverIntensity={0.5} rotateOnHover={true} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl w-full text-center space-y-8 glass p-8 md:p-12 rounded-3xl border border-white/10 relative z-10 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10"
                >
                    <div className="h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 -rotate-6">
                        <Clock className="w-10 h-10 text-white" />
                    </div>

                    <div className="space-y-4">
                        <GradientText
                            colors={["#6366f1", "#8b5cf6", "#a855f7"]}
                            animationSpeed={3}
                            showBorder={false}
                            className="text-3xl md:text-4xl font-bold tracking-tight"
                        >
                            Under Review
                        </GradientText>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Your profile is currently under review by our cosmic moderators.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 text-left">
                            <div className="h-10 w-10 shrink-0 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-sm text-slate-300">
                                This helps us keep the community safe and authentic. Once approved, you'll be able to browse and connect with others!
                            </p>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full h-14 text-lg font-bold border-white/10 hover:bg-white/5 text-slate-300 rounded-xl transition-all"
                        >
                            <Link href="/dashboard">View Your Draft</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

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
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />

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
                                <PaginationControls
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
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
