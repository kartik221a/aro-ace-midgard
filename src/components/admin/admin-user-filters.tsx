"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface UserFilterState {
    searchTerm: string;
    role: string;
    status: string; // 'active' | 'banned' | 'all'
}

interface AdminUserFiltersProps {
    filters: UserFilterState;
    setFilters: (filters: UserFilterState) => void;
    totalResults: number;
}

export function AdminUserFilters({ filters, setFilters, totalResults }: AdminUserFiltersProps) {
    const update = (key: keyof UserFilterState, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            searchTerm: "",
            role: "all",
            status: "all",
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
                    <Label className="text-slate-300 text-xs">Search Name or Email</Label>
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

                <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Account Role</Label>
                    <SearchableSelect
                        value={filters.role}
                        onChange={(val) => update("role", val)}
                        options={[
                            { label: "Any Role", value: "all" },
                            { label: "User", value: "user" },
                            { label: "Admin", value: "admin" },
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Account Status</Label>
                    <SearchableSelect
                        value={filters.status}
                        onChange={(val) => update("status", val)}
                        options={[
                            { label: "Any Status", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Banned", value: "banned" },
                        ]}
                    />
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-8"
                    onClick={clearFilters}
                    disabled={filters.searchTerm === "" && filters.role === "all" && filters.status === "all"}
                >
                    <X className="w-3 h-3 mr-2" /> Clear Filters
                </Button>
            </div>
        </div>
    );
}
