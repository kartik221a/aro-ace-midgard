"use client";

import { TextLoopSection } from "@/components/home-components/text-loop-section";
import AboutSection from "@/components/home-components/about-section";
import HeroSection from "@/components/home-components/hero-section";
import HowItWorksSection from "@/components/home-components/how-it-works-section";

export default function Home() {



  return (
    <div className="flex flex-col min-h-screen text-slate-100 overflow-x-hidden">

      {/* Hero Section */}
      <HeroSection />
      {/* Hero Section End*/}

      {/* Text Loop Section */}
      <TextLoopSection />
      {/* Text Loop Section End */}

      {/* About Section */}
      <AboutSection />
      {/* About Section End */}


      {/* How It Works Section */}
      <HowItWorksSection />
      {/* How It Works Section End*/}

    </div>
  );
}
