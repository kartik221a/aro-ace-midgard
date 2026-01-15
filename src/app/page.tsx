"use client";

import Link from "next/link";
import Orb from "@/components/Orb";
import GradientText from "@/components/GradientText";
import ShinyText from "@/components/ShinyText";
import StarBorder from "@/components/StarBorder";
import CurvedLoop from "@/components/CurvedLoop";
import LaserFlow from "@/components/LaserFlow";
import ScrollReveal from "@/components/ScrollReveal";
import SplitText from "@/components/SplitText";
import { Cobe } from "@/components/ui/cobe-globe";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user } = useAuth();

  const howItWorksContent = [
    {
      title: "1️⃣ Create Your Profile",
      description:
        "Share who you are, your boundaries, and what you’re looking for. Express yourself in your own words, set clear comfort levels, and choose whether you’re open to friendships, partnerships, or both. Your profile is fully in your control.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white text-lg font-bold">
          Image 1
        </div>
      ),
    },
    {
      title: "2️⃣ Browse & Like",
      description:
        "Like someone as a Friend 💙 or Partner ❤️. Explore profiles at your own pace and interact intentionally. Every like clearly reflects your intention, whether it’s a platonic connection or a deeper relationship.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--pink-500),var(--indigo-500))] flex items-center justify-center text-white text-lg font-bold">
          Image 2
        </div>
      ),
    },
    {
      title: "3️⃣ Mutual Match",
      description:
        "Only when both people agree, a connection is created. There are no unsolicited messages or surprises. Connections happen only through mutual interest, keeping interactions respectful and consent-based.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white text-lg font-bold">
          Image 3
        </div>
      ),
    },
    {
      title: "4️⃣ Connect Safely",
      description:
        "No personal numbers shared. Privacy comes first. Communicate within the platform without revealing personal contact details. Your safety, comfort, and anonymity are always prioritized.",
      content: (
        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white text-lg font-bold">
          Image 4
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full h-[80vh] flex flex-col items-center justify-center overflow-hidden">
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
              colors={["#f43f5e", "#8b5cf6", "#3b82f6"]}
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

          <div className="flex flex-col sm:flex-row gap-6 mt-8">
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

      {/* Curved Loop Section */}
      <section className="w-full py-8 bg-slate-950/50 backdrop-blur-sm z-20 relative border-t border-white/5 overflow-hidden">
        <CurvedLoop
          marqueeText="🛡️ Privacy First • 🌈 Aroace-Centered • 🤝 Consent & Boundaries • 🧠 Community Moderated • "
          className="text-emerald-400 font-bold tracking-widest"
          speed={3}
        />
      </section>

      {/* About Section */}
      <section className="w-full px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative min-h-[800px]">

            {/* 1. Laser Div */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <LaserFlow
                horizontalSizing={1.01}
                verticalSizing={4}
                fogIntensity={1}
                fogScale={0.25}
                decay={1.06}
                falloffStart={2.12}
                verticalBeamOffset={0}
                color="#b494ff"
                flowSpeed={0.5}
              />
            </div>

            {/* 2. Box Div */}
            <div className="absolute inset-x-0 bottom-[10%] z-10 px-4 flex justify-center">
              <div className="w-full max-w-[95%] md:max-w-[1000px] h-[500px] p-[3px] rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-white/50">
                <div className="w-full h-full bg-slate-950/90 backdrop-blur-md rounded-[21px] p-8 md:p-12 text-center relative overflow-hidden">

                  {/* Globe */}
                  <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60 pointer-events-none">
                    <div className="w-[1000px] h-[1000px]">
                      <Cobe
                        variant="default"
                        scale={2}
                        className="w-full h-full"
                        baseColor="#555555"
                        glowColor="#a78bfa"
                        markerColor="#ec4899"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
                    <GradientText
                      colors={["#c084fc", "#e879f9", "#ffffff"]}
                      animationSpeed={4}
                      showBorder={false}
                      className="text-4xl md:text-5xl font-bold"
                    >
                      What is this place?
                    </GradientText>

                    <div className="space-y-6">
                      <ShinyText
                        text="This platform is built for people on the aromantic and asexual spectrums who want to connect on their own terms."
                        disabled={false}
                        speed={3}
                        className="text-md md:text-xl leading-relaxed text-slate-300 block"
                      />
                      <ShinyText
                        text="Whether you’re here for friendship, companionship, or a romantic relationship that respects your boundaries, this space is designed to support you."
                        disabled={false}
                        speed={3}
                        className="text-md md:text-xl leading-relaxed text-slate-300 block"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>







      {/* How It Works Section */}
      <section className="w-full py-24 bg-slate-950 px-4">
        <div className="text-center mb-16">
          <SplitText
            text="How It Works"
            className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400"
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

    </div>
  );
}
