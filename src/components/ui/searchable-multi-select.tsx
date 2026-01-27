"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type Option = {
    label: string;
    value: string;
};

interface SearchableMultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function SearchableMultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: SearchableMultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const toggleValue = (value: string) => {
        const safeSelected = Array.isArray(selected) ? selected : [];
        const newSelected = safeSelected.includes(value)
            ? safeSelected.filter((v) => v !== value)
            : [...safeSelected, value];
        onChange(newSelected);
    };

    const handleUnselect = (value: string) => {
        onChange(selected.filter((v) => v !== value));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full min-h-10 h-auto justify-between px-3 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length > 0 ? (
                            selected.map((val) => {
                                const option = options.find((o) => o.value === val);
                                return (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="bg-purple-500/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30"
                                    >
                                        {option?.label ?? val}
                                        <button
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(val);
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={() => handleUnselect(val)}
                                        >
                                            <X className="h-3 w-3 text-purple-300 hover:text-white" />
                                        </button>
                                    </Badge>
                                );
                            })
                        ) : (
                            <span className="text-slate-500">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#0f111a] border-white/10">
                <Command className="bg-transparent text-white">
                    <CommandInput placeholder="Search..." className="text-white" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                            No result found.
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label.toLowerCase()}
                                    onPointerDown={(e) => e.preventDefault()}
                                    onSelect={() => toggleValue(option.value)}
                                    className="text-slate-300 aria-selected:bg-purple-500/20 aria-selected:text-purple-300"
                                >
                                    <div
                                        className={cn(
                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-purple-500/50 pointer-events-none",
                                            selected.includes(option.value)
                                                ? "bg-purple-600 text-white"
                                                : "opacity-50"
                                        )}
                                    >
                                        {selected.includes(option.value) && (
                                            <Check className="h-3 w-3" />
                                        )}
                                    </div>
                                    <span className="pointer-events-none">{option.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
