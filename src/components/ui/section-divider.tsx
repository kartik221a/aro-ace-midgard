
import { cn } from "@/lib/utils";

interface SectionDividerProps {
    title?: string;
    className?: string;
}

export function SectionDivider({ title, className }: SectionDividerProps) {
    return (
        <div className={cn("flex items-center justify-center my-8 text-slate-400", className)}>
            <span className="text-xl">˚ʚ♡ɞ˚ ┈┈ ◦•◦</span>
            {title && <span className="mx-4 font-medium text-slate-600 dark:text-slate-300 font-serif italic text-lg opacity-80">꒰ {title} ꒱</span>}
            <span className="text-xl">◦•◦ ┈┈ ˚ʚ♡ɞ˚</span>
        </div>
    );
}
