"use client";

import * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Country {
    name: string;
    code: string;
}

interface CountrySelectorProps {
    value: string | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function CountrySelector({ value, onChange, placeholder = "Select country..." }: CountrySelectorProps) {
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
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                <SelectValue placeholder={loading ? "Loading countries..." : placeholder} />
            </SelectTrigger>
            <SelectContent className="max-h-80 bg-[#0f111a] border-white/10 text-slate-300">
                {countries.map((country) => (
                    <SelectItem
                        key={country.code}
                        value={country.name}
                        className="focus:bg-purple-500/20 focus:text-purple-300 cursor-pointer"
                    >
                        {country.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
