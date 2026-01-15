"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Introduction } from "@/types";
import { SectionDivider } from "@/components/ui/section-divider";
import { IntroductionCard } from "@/components/introduction-card";
import { BrowseFilters, FilterState } from "@/components/browse/browse-filters";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";
import { SplitText } from "@/components/ui/reactbits/split-text";
import { motion } from "framer-motion";

export default function BrowsePage() {
    const { user } = useAuth();
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [loading, setLoading] = useState(true);
    const [myLikes, setMyLikes] = useState<Record<string, LikeType>>({});

    useEffect(() => {
        if (user) {
            const unsubscribe = LikesService.listenToMyLikes(user.uid, (likes) => {
                setMyLikes(likes);
            });
            return () => unsubscribe();
        } else {
            setMyLikes({});
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
            // 0. Exclude already likes (Friend or Partner)
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
                // If user hasn't set it, we probably shouldn't filter them out unless looking for "not set"? 
                // Usually blank means unspecified. Let's assume if filter is set, we strictly match.
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

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <SplitText
                                text="Browse Introductions"
                                className="text-4xl font-bold text-white inline-block"
                                delay={0.1}
                            />
                        </h1>
                        <p className="text-slate-400">Find new friends and potential partners.</p>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10">
                                    <Filter className="w-4 h-4 mr-2" /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-[#0f111a] border-r border-white/10 text-slate-200">
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

                    {/* Grid */}
                    <div className="flex-1 w-full min-w-0">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-96 bg-white/5 rounded-xl animate-pulse border border-white/5" />
                                ))}
                            </div>
                        ) : filteredIntroductions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredIntroductions.map(intro => (
                                    <motion.div
                                        key={intro.uid}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <IntroductionCard
                                            introduction={intro}
                                            myLikeStatus={myLikes[intro.uid] || null}
                                            onToggleLike={(type) => {
                                                if (user) {
                                                    LikesService.toggleLike(user.uid, intro.uid, type);
                                                } else {
                                                    // Optional: Redirect to login or show toast
                                                    alert("Please sign in to like!");
                                                }
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10 backdrop-blur-sm">
                                <h3 className="text-lg font-medium text-slate-200 mb-2">No matches found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                                    Try adjusting your filters to see more results.
                                </p>
                                <Button
                                    variant="link"
                                    className="text-rose-400 hover:text-rose-300"
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
