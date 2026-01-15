"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

// ReactBits component: MagnetButton
// Magnetic button effect

export default function MagnetButton({
    children,
    className = "",
    strength = 50, // Strength of the magnetic pull
    ...props
}: {
    children: React.ReactNode;
    className?: string;
    strength?: number;
    [key: string]: any;
}) {
    const ref = useRef<HTMLButtonElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const moveX = (clientX - centerX) / (width / 2);
        const moveY = (clientY - centerY) / (height / 2);

        x.set(moveX * strength);
        y.set(moveY * strength);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: springX, y: springY }}
            className={`relative inline-flex items-center justify-center px-6 py-3 font-medium transition-colors border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
}
