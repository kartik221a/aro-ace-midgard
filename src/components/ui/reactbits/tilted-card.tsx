"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ReactBits component: TiltedCard
// 3D Tilted Card effect

export default function TiltedCard({
    children,
    className = "",
    tiltStrength = 20, // max tilt in degrees
    glareOpacity = 0.4,
    scaleOnHover = 1.05,
}: {
    children: React.ReactNode;
    className?: string;
    tiltStrength?: number;
    glareOpacity?: number;
    scaleOnHover?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 100, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 100, damping: 20 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], [tiltStrength, -tiltStrength]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-tiltStrength, tiltStrength]);

    // Glare effect
    const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
    const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);
    const glareBackground = useTransform(
        [glareX, glareY],
        ([gx, gy]) =>
            `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glareOpacity}) 0%, rgba(255,255,255,0) 80%)`
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current!.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXPos = e.clientX - rect.left;
        const mouseYPos = e.clientY - rect.top;

        const xPct = mouseXPos / width - 0.5;
        const yPct = mouseYPos / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            whileHover={{ scale: scaleOnHover }}
            className={`relative ${className}`}
        >
            <div style={{ transform: "translateZ(50px)" }} className="relative z-10">
                {children}
            </div>

            {/* Glare Layer */}
            <motion.div
                className="absolute inset-0 rounded-xl z-20 pointer-events-none"
                style={{ background: glareBackground, mixBlendMode: 'overlay' }}
            />
        </motion.div>
    );
}
