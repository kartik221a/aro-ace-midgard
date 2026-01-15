"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "@/components/ui/reactbits/spotlight-card.css";

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}

export const AnimatedCard = ({ children, className, delay = 0, onClick }: AnimatedCardProps) => {
    // Spotlight logic
    const divRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        divRef.current.style.setProperty('--mouse-x', `${x}px`);
        divRef.current.style.setProperty('--mouse-y', `${y}px`);
        divRef.current.style.setProperty('--spotlight-color', 'rgba(255, 255, 255, 0.1)'); // Interactive spotlight color
    };

    return (
        <motion.div
            ref={divRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: "easeOut"
            }}
            whileHover={{
                scale: 1.02,
                translateY: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "glass rounded-xl p-6 relative overflow-hidden group cursor-pointer border border-white/10 card-spotlight", // Added card-spotlight class
                className
            )}
        >
            {/* Spotlight gradient effect (CSS based on card-spotlight + manual overlay for extra pop) */}
            <div
                className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            />

            {/* ReactBits Spotlight Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 80%)`
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};
