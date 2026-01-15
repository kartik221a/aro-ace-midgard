"use client";

import LaserFlow from '@/components/LaserFlow';
import { useRef } from 'react';

import GradientText from '../GradientText';
import ShinyText from '../ShinyText';
import { Cobe } from '../ui/cobe-globe';

// About Section with Interactive Laser Reveal Effect
export default function AboutSection() {
    const revealImgRef = useRef<HTMLImageElement>(null);

    return (
        <div
            style={{
                height: '800px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#000000'
            }}
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const el = revealImgRef.current;
                if (el) {
                    el.style.setProperty('--mx', `${x}px`);
                    el.style.setProperty('--my', `${y + rect.height * 0.5}px`);
                }
            }}
            onMouseLeave={() => {
                const el = revealImgRef.current;
                if (el) {
                    el.style.setProperty('--mx', '-9999px');
                    el.style.setProperty('--my', '-9999px');
                }
            }}
        >
            <LaserFlow
                horizontalBeamOffset={0.1}
                verticalBeamOffset={0.0}
                color="#CF9EFF"
            />

            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '86%',
                height: '60%',
                backgroundColor: '#000000',
                borderRadius: '20px',
                border: '2px solid #CF9EFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                zIndex: 6
            }}>

                <div className="w-full h-full bg-black/40 backdrop-blur-md rounded-[21px] p-8 md:p-12 text-center relative overflow-hidden">

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
                            colors={["#a855f7", "#d946ef", "#ec4899"]} // Purple to Fuchsia to Pink
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

            <img
                ref={revealImgRef}
                src="/assets/ace_from_space.jfif" // Placeholder, user likely needs to update this
                alt="Reveal effect"
                style={{
                    position: 'absolute',
                    width: '100%',
                    top: '-50%',
                    zIndex: 5,
                    mixBlendMode: 'lighten',
                    opacity: 0.3,
                    pointerEvents: 'none',
                    '--mx': '-9999px',
                    '--my': '-9999px',
                    WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
                    maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat'
                } as React.CSSProperties}
            />
        </div>
    );
}