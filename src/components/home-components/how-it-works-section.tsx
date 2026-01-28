"use client";

import SplitText from "@/components/SplitText";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import Image from "next/image";

export default function HowItWorksSection() {
    const howItWorksContent = [
        {
            title: "1️⃣ Create Your Profile",
            description:
                "Share who you are, your boundaries, and what you’re looking for. Express yourself in your own words, set clear comfort levels, and choose whether you’re open to friendships, partnerships, or both. Your profile is fully in your control.",
            content: (
                <div className="h-full w-full flex items-center justify-center text-white relative">
                    <Image
                        src="/assets/how_it_works_1.png"
                        fill
                        className="object-cover"
                        alt="Create Your Profile"
                    />
                </div>
            ),
        },
        {
            title: "2️⃣ Browse & Like",
            description:
                "Like someone as a Friend 💙 or Partner ❤️. Explore profiles at your own pace and interact intentionally. Every like clearly reflects your intention, whether it’s a platonic connection or a deeper relationship.",
            content: (
                <div className="h-full w-full flex items-center justify-center text-white relative">
                    <Image
                        src="/assets/how_it_works_2.png"
                        fill
                        className="object-cover"
                        alt="Browse & Like"
                    />
                </div>
            ),
        },
        {
            title: "3️⃣ Mutual Match",
            description:
                "Only when both people agree, a connection is created. There are no unsolicited messages or surprises. Connections happen only through mutual interest, keeping interactions respectful and consent-based.",
            content: (
                <div className="h-full w-full flex items-center justify-center text-white relative">
                    <Image
                        src="/assets/how_it_works_3.png"
                        fill
                        className="object-cover"
                        alt="Mutual Match"
                    />
                </div>
            ),
        },
        {
            title: "4️⃣ Connect Safely",
            description:
                "No personal numbers shared. Privacy comes first. Communicate within the platform without revealing personal contact details. Your safety, comfort, and anonymity are always prioritized.",
            content: (
                <div className="h-full w-full flex items-center justify-center text-white relative">
                    <Image
                        src="/assets/how_it_works_4.png"
                        fill
                        className="object-cover"
                        alt="Connect Safely"
                    />
                </div>
            ),
        },
    ];

    return (
        <section className="w-full py-24 px-4 overflow-hidden">
            <div className="text-center mb-16">
                <SplitText
                    text="How It Works"
                    className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400"
                    delay={50}
                    from={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                    to={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                    threshold={0.2}
                    rootMargin="-50px"
                />
            </div>

            <div className="max-w-5xl mx-auto">
                <StickyScroll content={howItWorksContent} />
            </div>
        </section>
    );
}
