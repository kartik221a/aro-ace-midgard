"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

export type Option = {
    label: string;
    value: string;
};

interface SearchableSelectProps {
    options: Option[];
    value: string | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                        className
                    )}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label || value
                        : placeholder}
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
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="text-slate-300 aria-selected:bg-purple-500/20 aria-selected:text-purple-300 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
