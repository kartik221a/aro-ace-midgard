"use client";

import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

export function TextLoopSection() {
    return (
        <div className="rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
            <InfiniteMovingCards
                items={testimonials}
                direction="right"
                speed="slow"
            />
        </div>
    );
}

const testimonials = [
    {
        quote:
            "In The Lover's Dictionary, expresses a desire to love and be loved without the desire for a lover.",
        name: "David Levithan",

    },
    {
        quote:
            "Give your friendships the magic you would give a romance. Because they're just as important. Actually, for us, they're way more important.",
        name: "Alice Oseman",

    },
    {
        quote: "It wasn't that she hated the idea of sex, just . . . she didn't want it. Didn't need it. But no one else ever seemed to feel that way.",
        name: "Elyse Springer",
    },
    {
        quote:
            "Frequently associated with the aromantic spectrum, Tesla remained celibate and stated that his lack of sexual interest was \"integral to his scientific abilities and achievements,\" noting he found all necessary stimulation in his work.",
        name: "Nikola Tesla",
    },
    {
        quote:
            "Some people misinterpret aesthetic appreciation, romantic attraction, or sexual arousal as being sexual attraction, only to realize later that they are asexual.",
        name: "Julie Sondra Decker",
    },
];
