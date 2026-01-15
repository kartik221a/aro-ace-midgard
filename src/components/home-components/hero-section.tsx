"use client";

import Link from "next/link";
import Orb from "@/components/Orb";
import GradientText from "@/components/GradientText";
import ShinyText from "@/components/ShinyText";
import StarBorder from "@/components/StarBorder";
import { useAuth } from "@/lib/auth-context";

export default function HeroSection() {
    const { user } = useAuth();

    return (
        <section className="relative w-full min-h-[90vh] md:h-screen flex flex-col items-center justify-center pt-28 pb-12 md:pt-16 md:pb-0 overflow-hidden">
            {/* Background Orb */}
            <div className="absolute inset-0 z-0">
                <Orb
                    hue={290}
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center px-4 flex flex-col items-center gap-6">
                <div className="mb-4">
                    <GradientText
                        colors={["#a855f7", "#d946ef", "#ec4899"]} // Purple to Fuchsia to Pink
                        animationSpeed={3}
                        showBorder={false}
                        className="text-5xl md:text-7xl font-bold tracking-tight"
                    >
                        Welcome to AroAce Midgard
                    </GradientText>
                </div>

                <ShinyText
                    text="A safe, aesthetic, and moderated space to introduce yourself and find others. Connect with friends or partners in a pressure-free environment."
                    disabled={false}
                    speed={3}
                    className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-slate-300"
                />

                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
                    <Link href={user ? "/browse" : "/login"}>
                        <StarBorder as="button" className="text-white">
                            Browse Introductions
                        </StarBorder>
                    </Link>

                    <Link href={user ? "/dashboard" : "/login"}>
                        <StarBorder as="button" color="#ec4899" className="text-white">
                            Create Yours
                        </StarBorder>
                    </Link>
                </div>
            </div>
        </section>
    );
}
