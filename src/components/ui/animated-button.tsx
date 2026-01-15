"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
    variant?: "default" | "outline" | "ghost" | "destructive" | "premium";
    size?: "default" | "sm" | "lg" | "icon";
    isLoading?: boolean;
}

export const AnimatedButton = ({
    children,
    className,
    variant = "default",
    size = "default",
    isLoading = false,
    ...props
}: AnimatedButtonProps) => {

    const getVariantClasses = () => {
        if (variant === "premium") {
            return "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 hover:opacity-90";
        }
        return "";
    };

    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return "h-9 px-3 rounded-md text-sm";
            case "lg":
                return "h-11 px-8 rounded-md";
            case "icon":
                return "h-10 w-10 p-0";
            default:
                return "h-10 px-4 py-2"; // Standard button size
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || props.disabled}
            className={cn(
                "relative inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
                variant === "default" && "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10",
                variant === "outline" && "border border-white/20 bg-transparent hover:bg-white/10 text-white",
                variant === "ghost" && "hover:bg-white/10 text-slate-200",
                getVariantClasses(),
                getSizeClasses(),
                className
            )}
            {...(props as any)}
        >
            {isLoading && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                />
            )}
            {children}
        </motion.button>
    );
};
