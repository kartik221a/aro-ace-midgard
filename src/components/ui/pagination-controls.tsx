"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
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

    return (
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
                            onClick={() => onPageChange(p)}
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
}
