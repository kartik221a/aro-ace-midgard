"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
    animate?: boolean;
}

export const GradientText = ({ children, className, animate = true }: GradientTextProps) => {
    return (
        <motion.span
            initial={animate ? { opacity: 0, y: 10 } : undefined}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-bold",
                className
            )}
        >
            {children}
        </motion.span>
    );
};
