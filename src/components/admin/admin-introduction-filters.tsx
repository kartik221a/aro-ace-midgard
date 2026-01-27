"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface IntroFilterState {
    searchTerm: string;
    genders: string[];
    intents: string[];
}

interface AdminIntroductionFiltersProps {
    filters: IntroFilterState;
    setFilters: (filters: IntroFilterState) => void;
    totalResults: number;
}

const toOptions = (arr: string[]): Option[] => arr.map(s => ({ label: s, value: s }));

export function AdminIntroductionFilters({ filters, setFilters, totalResults }: AdminIntroductionFiltersProps) {
    const update = (key: keyof IntroFilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: "",
            genders: [],
            intents: [],
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                    <Filter className="w-4 h-4 text-purple-400" /> Filters
                </h2>
                <Badge variant="secondary" className="bg-white/10 text-slate-300 border-white/5">
                    {totalResults} found
                </Badge>
            </div>

            <div className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Search Name</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Type to search..."
                            value={filters.searchTerm}
                            onChange={(e) => update("searchTerm", e.target.value)}
                            className="pl-9 h-9 bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600 focus-visible:ring-purple-500/50"
                        />
                    </div>
                </div>

                {/* Looking For */}
                <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Looking For</Label>
                    <Select
                        value={filters.intents[0] || "all"}
                        onValueChange={(val) => update("intents", val === "all" ? [] : [val])}
                    >
                        <SelectTrigger className="h-9 bg-white/5 border-white/10 text-slate-200">
                            <SelectValue placeholder="Any Intent" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1d2d] border-white/10 text-slate-200">
                            <SelectItem value="all">Any Intent</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                            <SelectItem value="relationship">Relationship</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Gender</Label>
                    <MultiSelect
                        options={toOptions(C.GENDER_OPTIONS)}
                        selected={filters.genders}
                        onChange={(val) => update("genders", val)}
                        placeholder="Any Gender"
                        className="bg-white/5 border-white/10 text-slate-200"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-8"
                    onClick={clearFilters}
                    disabled={!filters.searchTerm && filters.genders.length === 0 && filters.intents.length === 0}
                >
                    <X className="w-3 h-3 mr-2" /> Clear Filters
                </Button>
            </div>
        </div>
    );
}
