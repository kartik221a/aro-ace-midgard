"use client";

import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { useEffect, useRef } from "react";

type SplitTextProps = {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    animationFrom?: any; // kept for compatibility in prop interface, though framer uses variants
    animationTo?: any;
    threshold?: number;
    rootMargin?: string;
};

export const SplitText = ({
    text,
    className = "",
    delay = 0.05,
    duration = 0.5
}: SplitTextProps) => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        } else {
            controls.start("hidden");
        }
    }, [isInView, controls, text]);

    const words = text.split(" "); // Simple split by words for now

    const container: any = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: delay, delayChildren: 0.04 * i },
        }),
    };

    const child: any = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
                duration: duration,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
                duration: duration,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={container}
            initial="hidden"
            animate={controls}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%" }}
        >
            {words.map((word, index) => (
                <motion.div key={`${word}-${index}`} style={{ marginRight: "0.25em", display: "flex" }}>
                    <motion.span variants={child}>
                        {word}
                    </motion.span>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default SplitText;
