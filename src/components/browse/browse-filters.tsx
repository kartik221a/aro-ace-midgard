"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import * as C from "@/lib/constants";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"; // Assuming we have Sheet or similar for mobile, or I'll just use a collapsible div for simplicity first if Sheet isn't confirmed. 
// Actually, standard shadcn layout likely has Sheet. If not, I'll stick to a responsive column.
// Based on file list, I don't see sheet explicitly viewed, but usually it's there. I'll stick to a simple sidebar column for Desktop and a collapsible styling for mobile.

export interface FilterState {
    searchTerm: string;
    ageRange: [number, number];
    intents: string[];
    sexDesire: string[];
    romanceDesire: string[];
    genders: string[];
    longDistance: string[];
    qpr: string[];
    polyamory: string[];
    marriage: string[];
}

interface BrowseFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    totalResults: number;
}

// Helper
const toOptions = (arr: string[]): Option[] => arr.map(s => ({ label: s, value: s }));

export function BrowseFilters({ filters, setFilters, totalResults }: BrowseFiltersProps) {
    // Helper to update a single field
    const update = (key: keyof FilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const [localAgeRange, setLocalAgeRange] = useState<[number, number]>(filters.ageRange);

    // Sync local state when parent filters change (e.g. clear filters)
    useEffect(() => {
        setLocalAgeRange(filters.ageRange);
    }, [filters.ageRange]);

    const clearFilters = () => {
        setFilters({
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
    };


    return (
        <div className="h-fit sticky top-24">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f111a]/80 backdrop-blur-xl shadow-2xl p-6">
                {/* Decorative Gradient Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h2 className="font-bold text-xl flex items-center gap-2 text-white">
                        <Filter className="w-5 h-5 text-purple-400" /> Filters
                    </h2>
                    <Badge variant="secondary" className="bg-white/10 text-slate-300 border-white/5">
                        {totalResults} found
                    </Badge>
                </div>

                <div className="relative z-10">
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by name..."
                                    value={filters.searchTerm}
                                    onChange={(e) => update("searchTerm", e.target.value)}
                                    className="pl-9 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-purple-500/50"
                                />
                            </div>
                        </div>

                        {/* Age Range */}
                        <div className="space-y-4">
                            <Label className="text-slate-300">Age Range</Label>
                            <div className="flex items-center gap-4">
                                {/* Min Age Group */}
                                <div className="flex-1 space-y-1">
                                    <span className="text-xs text-slate-500 font-medium ml-1">Min</span>
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-r-none border-r-0 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            onClick={() => {
                                                const newMin = Math.max(18, filters.ageRange[0] - 1);
                                                if (newMin <= filters.ageRange[1]) {
                                                    update("ageRange", [newMin, filters.ageRange[1]]);
                                                }
                                            }}
                                            disabled={filters.ageRange[0] <= 18}
                                        >
                                            <span className="text-lg leading-none mb-0.5">-</span>
                                        </Button>

                                        <Input
                                            type="number"
                                            className="h-9 min-w-[3rem] w-full text-center border-y border-white/10 bg-black/20 text-sm font-medium rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-slate-200"
                                            value={isNaN(localAgeRange[0]) ? "" : localAgeRange[0]}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val)) {
                                                    setLocalAgeRange([val, localAgeRange[1]]);
                                                } else if (e.target.value === "") {
                                                    setLocalAgeRange([NaN, localAgeRange[1]]);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val) || val < 18) val = 18;
                                                if (val > 100) val = 100;
                                                if (val > filters.ageRange[1]) val = filters.ageRange[1];

                                                update("ageRange", [val, filters.ageRange[1]]);
                                                setLocalAgeRange([val, filters.ageRange[1]]);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-l-none border-l-0 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            onClick={() => {
                                                const newMin = Math.min(100, filters.ageRange[0] + 1);
                                                if (newMin <= filters.ageRange[1]) {
                                                    update("ageRange", [newMin, filters.ageRange[1]]);
                                                }
                                            }}
                                            disabled={filters.ageRange[0] >= filters.ageRange[1]}
                                        >
                                            <span className="text-lg leading-none mb-0.5">+</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Max Age Group */}
                                <div className="flex-1 space-y-1">
                                    <span className="text-xs text-slate-500 font-medium ml-1">Max</span>
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-r-none border-r-0 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            onClick={() => {
                                                const newMax = Math.max(18, filters.ageRange[1] - 1);
                                                if (newMax >= filters.ageRange[0]) {
                                                    update("ageRange", [filters.ageRange[0], newMax]);
                                                }
                                            }}
                                            disabled={filters.ageRange[1] <= filters.ageRange[0]}
                                        >
                                            <span className="text-lg leading-none mb-0.5">-</span>
                                        </Button>

                                        <Input
                                            type="number"
                                            className="h-9 min-w-[3rem] w-full text-center border-y border-white/10 bg-black/20 text-sm font-medium rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 text-slate-200"
                                            value={isNaN(localAgeRange[1]) ? "" : localAgeRange[1]}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val)) {
                                                    setLocalAgeRange([localAgeRange[0], val]);
                                                } else if (e.target.value === "") {
                                                    setLocalAgeRange([localAgeRange[0], NaN]);
                                                }
                                            }}
                                            onBlur={(e) => {
                                                let val = parseInt(e.target.value);
                                                if (isNaN(val) || val > 100) val = 100;
                                                if (val < 18) val = 18;
                                                if (val < filters.ageRange[0]) val = filters.ageRange[0];

                                                update("ageRange", [filters.ageRange[0], val]);
                                                setLocalAgeRange([filters.ageRange[0], val]);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-9 w-9 rounded-l-none border-l-0 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
                                            onClick={() => {
                                                const newMax = Math.min(100, filters.ageRange[1] + 1);
                                                if (newMax >= filters.ageRange[0]) {
                                                    update("ageRange", [filters.ageRange[0], newMax]);
                                                }
                                            }}
                                            disabled={filters.ageRange[1] >= 100}
                                        >
                                            <span className="text-lg leading-none mb-0.5">+</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/10" />

                        {/* Looking For (Intent) */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Looking For</Label>
                            <Select
                                value={filters.intents[0] || "all"}
                                onValueChange={(val) => update("intents", val === "all" ? [] : [val])}
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-slate-200">
                                    <SelectValue placeholder="Any Intent" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1d2d] border-white/10 text-slate-200">
                                    <SelectItem value="all">Any Intent</SelectItem>
                                    <SelectItem value="friends">Friends Only</SelectItem>
                                    <SelectItem value="relationship">Relationship Only</SelectItem>
                                    <SelectItem value="both">Friends & Relationship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Gender</Label>
                            <MultiSelect
                                options={toOptions(C.GENDER_OPTIONS)}
                                selected={filters.genders}
                                onChange={(val) => update("genders", val)}
                                placeholder="Any Gender"
                                className="bg-white/5 border-white/10 text-slate-200"
                            />
                        </div>

                        {/* Sex Desire */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Desire for Sex</Label>
                            <MultiSelect
                                options={toOptions(C.DESIRE_OPTIONS)}
                                selected={filters.sexDesire}
                                onChange={(val) => update("sexDesire", val)}
                                placeholder="Any Preference"
                                className="bg-white/5 border-white/10 text-slate-200"
                            />
                        </div>

                        {/* Romance Desire */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Desire for Romance</Label>
                            <MultiSelect
                                options={toOptions(C.DESIRE_OPTIONS)}
                                selected={filters.romanceDesire}
                                onChange={(val) => update("romanceDesire", val)}
                                placeholder="Any Preference"
                                className="bg-white/5 border-white/10 text-slate-200"
                            />
                        </div>

                        <hr className="border-slate-100" />

                        {/* Long Distance */}
                        <div className="space-y-2">
                            <Label>Long Distance</Label>
                            <MultiSelect
                                options={toOptions(C.LONG_DISTANCE_OPTIONS)}
                                selected={filters.longDistance}
                                onChange={(val) => update("longDistance", val)}
                                placeholder="Any"
                            />
                        </div>

                        {/* QPR */}
                        <div className="space-y-2">
                            <Label>QPR</Label>
                            <MultiSelect
                                options={toOptions(C.QPR_OPTIONS)}
                                selected={filters.qpr}
                                onChange={(val) => update("qpr", val)}
                                placeholder="Any"
                            />
                        </div>

                        {/* Polyamory */}
                        <div className="space-y-2">
                            <Label>Polyamory</Label>
                            <MultiSelect
                                options={toOptions(C.POLYAMORY_OPTIONS)}
                                selected={filters.polyamory}
                                onChange={(val) => update("polyamory", val)}
                                placeholder="Any"
                            />
                        </div>

                        {/* Marriage */}
                        <div className="space-y-2">
                            <Label>Marriage</Label>
                            <MultiSelect
                                options={toOptions(C.MARRIAGE_OPTIONS)}
                                selected={filters.marriage}
                                onChange={(val) => update("marriage", val)}
                                placeholder="Any"
                            />
                        </div>

                        <Button
                            variant="outline"
                            className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                            onClick={clearFilters}
                        >
                            Clear All Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
