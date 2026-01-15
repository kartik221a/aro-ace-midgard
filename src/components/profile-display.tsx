import { Introduction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ReactNode, useState } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Users } from "lucide-react";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";

interface ProfileDisplayProps {
    introduction: Introduction;
    isOwnProfile?: boolean;
    headerActions?: ReactNode;
    topOverlay?: ReactNode;
    myLikeStatus?: LikeType | null;
    matchStatus?: LikeType | null;
    onToggleLike?: (type: LikeType) => void;
}

export function ProfileDisplay({ introduction, isOwnProfile, headerActions, topOverlay, myLikeStatus, matchStatus, onToggleLike }: ProfileDisplayProps) {
    const { basicInfo, identity, lookingFor, lifestyle, longDescription, images } = introduction;
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Combine profile photo + gallery for the lightbox
    const allImages = [
        ...(images?.profileUrl ? [images.profileUrl] : []),
        ...(images?.gallery || [])
    ].filter(Boolean);

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () => setLightboxIndex(prev => (prev !== null && prev < allImages.length - 1 ? prev + 1 : 0));
    const prevImage = () => setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : allImages.length - 1));

    // Calculate initial index offset (if profile pic exists, gallery starts at 1)
    const galleryOffset = images?.profileUrl ? 1 : 0;

    // Helper to calculate age
    const calculateAge = (dobString?: string) => {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };
    const age = calculateAge(basicInfo?.dob);

    const DESIRE_SCALE = ["repulsed", "averse", "indifferent", "favourable", "desired"];

    const formatDesire = (selected: string[] | undefined) => {
        if (!selected || selected.length === 0) return "Any";
        // Sort based on scale index to ensure correct order
        const sorted = [...selected].sort((a, b) => DESIRE_SCALE.indexOf(a) - DESIRE_SCALE.indexOf(b));

        if (sorted.length === DESIRE_SCALE.length) return "Any";
        if (sorted.length === 1) return sorted[0]; // Title case handled by CSS or manually if needed? The values are lowercase.

        // Check if we effectively want a range display "From X to Y"
        const start = sorted[0];
        const end = sorted[sorted.length - 1];
        return `From ${start} to ${end}`;
    };

    return (
        <div className="bg-[#0f111a] min-h-screen pb-10 md:pb-20 text-slate-200 overflow-x-hidden">
            {/* Lightbox Overlay */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-purple-400 p-2 z-50">
                        <X size={32} />
                    </button>

                    <button onClick={prevImage} className="absolute left-4 bg-white/10 text-white hover:bg-white/20 border border-white/40 hover:border-white/60 rounded-full p-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-md z-50 transition-all active:scale-95">
                        <ChevronLeft size={32} />
                    </button>

                    <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <img
                            src={allImages[lightboxIndex]}
                            alt="Lightbox view"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    <button onClick={nextImage} className="absolute right-4 bg-white/10 text-white hover:bg-white/20 border border-white/40 hover:border-white/60 rounded-full p-4 shadow-[0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-md z-50 transition-all active:scale-95">
                        <ChevronRight size={32} />
                    </button>

                    <div className="absolute bottom-4 text-white/70 text-sm font-medium">
                        {lightboxIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}

            {/* Facebook Style Cover Section */}
            <div className="relative w-full">
                {/* Cover Image Container */}
                <div className="h-[250px] md:h-[400px] w-full bg-slate-900 relative overflow-hidden">
                    {images?.coverUrl ? (
                        <img src={images.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-transparent" />

                    {topOverlay && (
                        <div className="absolute top-6 right-6 z-10">
                            {topOverlay}
                        </div>
                    )}
                </div>

                {/* Profile Header Content */}
                <div className="max-w-7xl mx-auto px-3 md:px-4 relative -mt-16 md:-mt-20 pb-4 md:pb-8 border-b border-white/10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        {/* Profile Pictures Pillar */}
                        <div className="flex flex-col items-center gap-4 shrink-0">
                            {/* Main Profile Circle */}
                            <div
                                className="h-36 w-36 md:h-52 md:w-52 rounded-full border-4 border-[#0f111a] bg-[#1a1b26] shadow-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform z-20"
                                onClick={() => images?.profileUrl && openLightbox(0)}
                            >
                                {images?.profileUrl ? (
                                    <img src={images.profileUrl} alt={basicInfo?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-600 bg-slate-800">?</div>
                                )}
                            </div>

                            {/* Small Gallery Circles */}
                            {images?.gallery && images.gallery.length > 0 && (
                                <div className="flex gap-2">
                                    {images.gallery.slice(0, 3).map((img, idx) => (
                                        <div
                                            key={idx}
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[#0f111a] bg-[#1a1b26] shadow-lg overflow-hidden cursor-pointer hover:translate-y-[-2px] transition-transform"
                                            onClick={() => openLightbox(idx + galleryOffset)}
                                        >
                                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                    {images.gallery.length > 3 && (
                                        <div
                                            className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[#0f111a] bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] md:text-xs font-bold text-white cursor-pointer hover:bg-white/20"
                                            onClick={() => openLightbox(3 + galleryOffset)}
                                        >
                                            +{images.gallery.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 pb-1 md:pb-2">
                            <h1 className="text-2xl md:text-6xl font-black mb-1 md:mb-3 tracking-tight text-white leading-tight">{basicInfo?.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 md:gap-x-6 gap-y-0.5 md:gap-y-2 text-sm md:text-xl font-bold text-slate-400">
                                {age && <span>{age} Years</span>}
                                <span className="hidden md:block opacity-30">•</span>
                                <span className="capitalize">{basicInfo?.gender?.join(", ")}</span>
                                <span className="hidden md:block opacity-30">•</span>
                                <span>{basicInfo?.country}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pb-2 w-full md:w-auto">
                            {headerActions ? headerActions : !isOwnProfile && (
                                <>
                                    <MagnetButton
                                        className={cn(
                                            "w-full md:w-auto px-8 md:px-10 py-3 md:py-3.5 rounded-2xl flex items-center justify-center font-black transition-all shadow-2xl group text-sm md:text-base",
                                            myLikeStatus === "friend"
                                                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20"
                                                : "bg-white/5 border border-white/10 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                                        )}
                                        onClick={() => onToggleLike?.("friend")}
                                    >
                                        <Users className={cn("w-5 h-5 md:w-6 md:h-6 mr-3 transition-transform group-hover:scale-110", myLikeStatus === "friend" && "fill-current")} />
                                        {matchStatus === "friend" ? "Friends" : (myLikeStatus === "friend" ? "Request Sent" : "Like as Friend")}
                                    </MagnetButton>
                                    <MagnetButton
                                        className={cn(
                                            "w-full md:w-auto px-8 md:px-10 py-3 md:py-3.5 rounded-2xl flex items-center justify-center font-black transition-all shadow-2xl group text-sm md:text-base",
                                            myLikeStatus === "relationship"
                                                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-rose-500/20"
                                                : "bg-white/5 border border-white/10 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30"
                                        )}
                                        onClick={() => onToggleLike?.("relationship")}
                                    >
                                        <Heart className={cn("w-5 h-5 md:w-6 md:h-6 mr-3 transition-transform group-hover:scale-110", myLikeStatus === "relationship" && "fill-current")} />
                                        {matchStatus === "relationship" ? "Partners" : (myLikeStatus === "relationship" ? "Request Sent" : "Like as Partner")}
                                    </MagnetButton>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Body */}
            <div className="max-w-7xl mx-auto px-3 md:px-4 mt-6 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-16">

                {/* Left Column (Wide) - Bios */}
                <div className="lg:col-span-7 space-y-10 md:space-y-16">
                    {longDescription && longDescription.length > 0 ? (
                        longDescription.map((section) => (
                            <div key={section.id} className="group">
                                <h2 className="text-xl md:text-3xl font-black mb-3 md:mb-8 flex items-center gap-3 md:gap-5 text-white">
                                    <span className="w-1.5 h-6 md:w-2.5 md:h-10 bg-purple-600 rounded-full group-hover:h-8 md:group-hover:h-12 transition-all" />
                                    {section.title}
                                </h2>
                                <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl md:rounded-[2rem] p-5 md:p-12 shadow-2xl shadow-indigo-500/5 hover:border-white/20 transition-colors">
                                    <p className="text-base md:text-xl text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-16 text-center text-slate-500 italic text-xl">
                            No biography provided yet.
                        </div>
                    )}
                </div>

                {/* Right Column (Narrow) - Details */}
                <div className="lg:col-span-5 space-y-8 md:space-y-12">

                    {/* 1. Identity Snapshot Card */}
                    <SpotlightCard className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl" spotlightColor="rgba(139, 92, 246, 0.15)">
                        <div className="bg-gradient-to-r from-purple-600/30 via-indigo-600/20 to-transparent p-4 md:p-8 border-b border-white/10">
                            <h3 className="font-black text-purple-100 uppercase tracking-[0.2em] md:tracking-[0.4em] text-[9px] md:text-xs text-center">Identity Snapshot</h3>
                        </div>
                        <div className="p-2 md:p-5 space-y-0.5 md:space-y-2">
                            <DetailRow label="Pronouns" value={identity?.pronouns} />
                            <DetailRow label="Ethnicity" value={identity?.ethnicity?.join(", ")} />
                            <DetailRow label="Sexual Orientation" value={identity?.sexualOrientation} />
                            <DetailRow label="Romantic Orientation" value={identity?.romanticOrientation} />
                            <DetailRow label="Diet" value={identity?.diet} />
                            <DetailRow label="Build" value={identity?.build} />
                            <DetailRow label="Height" value={identity?.height ? `${identity.height.ft}'${identity.height.in} (${identity.height.cm}cm)` : undefined} />
                            <DetailRow label="Languages" value={identity?.languages?.join(", ")} />
                        </div>
                    </SpotlightCard>

                    {/* 2. Looking For Segmented Sections */}
                    <div className="space-y-6 md:space-y-10">
                        <div className="flex items-center gap-6">
                            <span className="h-px bg-gradient-to-r from-transparent to-white/10 flex-1" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] whitespace-nowrap">Intent & Preferences</span>
                            <span className="h-px bg-gradient-to-l from-transparent to-white/10 flex-1" />
                        </div>

                        {/* Intent Indicator */}
                        <div className="text-center">
                            <Badge className="bg-purple-600/20 text-purple-200 border-purple-500/30 px-8 py-2.5 text-xs font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_20px_rgba(147,51,234,0.1)]">
                                {lookingFor?.intent === 'both' ? 'Relationship & Friends' : lookingFor?.intent?.replace('relationship', 'Relationship')?.replace('friends', 'Friends')}
                            </Badge>
                        </div>

                        {/* Relationship Section */}
                        {(lookingFor?.intent === "relationship" || lookingFor?.intent === "both") && (
                            <div className="space-y-6 md:space-y-8">
                                <SpotlightCard
                                    className={cn(
                                        "rounded-2xl md:rounded-[2rem] border p-6 md:p-8 shadow-2xl transition-transform hover:scale-[1.01]",
                                        lookingFor?.intent === "relationship" ? "bg-rose-500/[0.08] border-rose-500/30" : "bg-white/5 border-white/10"
                                    )}
                                    spotlightColor="rgba(244, 63, 94, 0.2)"
                                >
                                    <h4 className="text-lg md:text-2xl font-black text-rose-300 mb-4 md:mb-8 flex items-center gap-2 md:gap-4">
                                        <Heart className="w-5 h-5 md:w-8 md:h-8 fill-current" />
                                        ME IN RELATIONSHIP
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                        <StatRow label="Desire for Sex" value={lookingFor?.personal?.sexDesire} />
                                        <StatRow label="Desire for Romance" value={lookingFor?.personal?.romanceDesire} />
                                        <StatRow label="Long Distance" value={lookingFor?.personal?.longDistance} />
                                        <StatRow label="QPR" value={lookingFor?.personal?.qpr} />
                                        <StatRow label="Polyamory" value={lookingFor?.personal?.polyamory} />
                                        <StatRow label="Kids" value={lookingFor?.personal?.kids} />
                                        <div className="col-span-2">
                                            <StatRow label="Marriage" value={lookingFor?.personal?.marriage} />
                                        </div>
                                    </div>
                                </SpotlightCard>

                                <SpotlightCard
                                    className={cn(
                                        "rounded-2xl md:rounded-[2rem] border p-6 md:p-8 shadow-2xl transition-transform hover:scale-[1.01]",
                                        lookingFor?.intent === "relationship" ? "bg-rose-500/[0.08] border-rose-500/30" : "bg-white/5 border-white/10"
                                    )}
                                    spotlightColor="rgba(244, 63, 94, 0.2)"
                                >
                                    <h4 className="text-lg md:text-2xl font-black text-rose-300 mb-4 md:mb-8 flex items-center gap-2 md:gap-4">
                                        <Heart className="w-5 h-5 md:w-8 md:h-8" />
                                        PARTNER PREFERENCE
                                    </h4>
                                    <div className="space-y-6">
                                        <StatRow label="Age Range" value={lookingFor?.partner?.ageRange ? `${lookingFor.partner.ageRange[0]} - ${lookingFor.partner.ageRange[1]}` : undefined} />
                                        <StatRow label="Genders" value={lookingFor?.partner?.gender?.join(", ")} />
                                        <StatRow label="Partner's Sex Desire" value={formatDesire(lookingFor?.partner?.sexDesire)} />
                                        <StatRow label="Partner's Romance Desire" value={formatDesire(lookingFor?.partner?.romanceDesire)} />
                                    </div>
                                </SpotlightCard>

                                {/* Status Pills */}
                                {(lookingFor?.toggles?.hasKids || lookingFor?.toggles?.isTaken) && (
                                    <div className="flex flex-wrap gap-3">
                                        {lookingFor.toggles.hasKids && <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 py-3 px-6 rounded-2xl font-bold flex-1 text-center">I already have children</Badge>}
                                        {lookingFor.toggles.isTaken && <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 py-3 px-6 rounded-2xl font-bold flex-1 text-center">I am currently in a relationship</Badge>}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Friends Section */}
                        {(lookingFor?.intent === "friends" || lookingFor?.intent === "both") && (
                            <SpotlightCard className="bg-emerald-500/[0.08] rounded-2xl md:rounded-[2rem] border border-emerald-500/20 p-6 md:p-8 shadow-2xl transition-transform hover:scale-[1.01]" spotlightColor="rgba(16, 185, 129, 0.2)">
                                <h4 className="text-lg md:text-2xl font-black text-emerald-300 mb-4 md:mb-8 flex items-center gap-2 md:gap-4">
                                    <Users className="w-5 h-5 md:w-8 md:h-8 fill-current" />
                                    FRIENDSHIP PREFS
                                </h4>
                                <div className="space-y-6">
                                    <StatRow label="Age Range" value={lookingFor?.friends?.ageRange ? `${lookingFor.friends.ageRange[0]} - ${lookingFor.friends.ageRange[1]}` : undefined} />
                                    <StatRow label="Genders" value={lookingFor?.friends?.gender?.join(", ")} />
                                </div>
                            </SpotlightCard>
                        )}
                    </div>

                    {/* 3. Lifestyle Details Card */}
                    <SpotlightCard className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl" spotlightColor="rgba(59, 130, 246, 0.15)">
                        <div className="bg-gradient-to-r from-indigo-600/30 via-purple-600/10 to-transparent p-5 md:p-7 border-b border-white/10">
                            <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-3 md:gap-4">
                                <span className="w-1 md:w-1.5 h-5 md:h-6 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                Lifestyle
                            </h3>
                        </div>
                        <div className="p-3 md:p-5 space-y-1">
                            <DetailRow label="Education" value={lifestyle?.education} />
                            <DetailRow label="Occupation" value={lifestyle?.occupation} />
                            <DetailRow label="Alcohol" value={lifestyle?.alcohol} />
                            <DetailRow label="Smoke" value={lifestyle?.smoke} />
                            <DetailRow label="Cannabis" value={lifestyle?.cannabis} />
                            <DetailRow label="Drugs" value={lifestyle?.drugs} />
                            <DetailRow label="Pets" value={lifestyle?.pets} />
                            <DetailRow label="Religion" value={lifestyle?.religion} />
                            <DetailRow label="Politics" value={lifestyle?.politics} />
                        </div>

                        {lifestyle?.interests && (
                            <div className="mt-4 md:mt-10 pt-4 md:pt-8 border-t border-white/10 p-4 md:p-0">
                                <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 md:mb-4">Interests</h4>
                                <p className="text-sm md:text-lg text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                    {lifestyle.interests}
                                </p>
                            </div>
                        )}
                    </SpotlightCard>

                </div>
            </div>
        </div>
    );
}

// Helper Components
function DetailRow({ label, value }: { label: string; value?: string | number }) {
    if (!value || value === "") return null;
    return (
        <div className="flex justify-between items-center p-2 md:p-4 hover:bg-white/[0.07] transition-all rounded-lg md:rounded-2xl group/row">
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em] group-hover/row:text-slate-400 transition-colors shrink mr-2 md:mr-8 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
            <span className="font-black text-slate-100 text-right leading-tight text-xs md:text-base ml-2">{value}</span>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value?: string | number }) {
    if (!value || value === "" || value === "Any") return null;
    return (
        <div className="flex flex-col gap-1 md:gap-2.5 p-1">
            <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] md:tracking-[0.2em]">{label}</span>
            <span className="font-black text-slate-100 capitalize text-sm md:text-base leading-tight">{value}</span>
        </div>
    );
}
