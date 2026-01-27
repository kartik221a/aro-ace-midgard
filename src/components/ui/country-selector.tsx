"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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

interface Country {
    name: string;
    code: string;
}

interface CountrySelectorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function CountrySelector({ value, onChange, placeholder = "Select country..." }: CountrySelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [countries, setCountries] = React.useState<Country[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
                const data = await response.json();
                const sortedCountries = data
                    .map((c: any) => ({
                        name: c.name.common,
                        code: c.cca2
                    }))
                    .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
                setCountries(sortedCountries);
            } catch (error) {
                console.error("Error fetching countries:", error);
                // Fallback to minimal list if API fails
                setCountries([
                    { name: "United States", code: "US" },
                    { name: "United Kingdom", code: "GB" },
                    { name: "Canada", code: "CA" },
                    { name: "Australia", code: "AU" },
                    { name: "India", code: "IN" },
                    { name: "Germany", code: "DE" },
                    { name: "France", code: "FR" },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
                >
                    {value
                        ? countries.find((country) => country.name === value)?.name || value
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#0f111a] border-white/10">
                <Command className="bg-transparent text-white">
                    <CommandInput placeholder="Search country..." className="text-white" />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                            {loading ? "Loading countries..." : "No country found."}
                        </CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.code}
                                    value={country.name}
                                    onSelect={(currentValue) => {
                                        onChange(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                    className="text-slate-300 aria-selected:bg-purple-500/20 aria-selected:text-purple-300 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === country.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {country.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
