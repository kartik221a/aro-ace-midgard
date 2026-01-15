import { Introduction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ReactNode, useState } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Users } from "lucide-react";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";
import TiltedCard from "@/components/ui/reactbits/tilted-card";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";

interface ProfileDisplayProps {
    introduction: Introduction;
    isOwnProfile?: boolean;
    headerActions?: ReactNode;
    topOverlay?: ReactNode;
    myLikeStatus?: LikeType | null;
    onToggleLike?: (type: LikeType) => void;
}

export function ProfileDisplay({ introduction, isOwnProfile, headerActions, topOverlay, myLikeStatus, onToggleLike }: ProfileDisplayProps) {
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
        <div className="bg-[#0f111a] min-h-screen pb-20">
            {/* Lightbox Overlay */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-rose-400 p-2 z-50">
                        <X size={32} />
                    </button>

                    <button onClick={prevImage} className="absolute left-4 text-white hover:text-rose-400 p-2 z-50">
                        <ChevronLeft size={48} />
                    </button>

                    <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <img
                            src={allImages[lightboxIndex]}
                            alt="Lightbox view"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>

                    <button onClick={nextImage} className="absolute right-4 text-white hover:text-rose-400 p-2 z-50">
                        <ChevronRight size={48} />
                    </button>

                    <div className="absolute bottom-4 text-white/70 text-sm font-medium">
                        {lightboxIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}

            {/* Cover Image */}
            <div className="relative h-64 md:h-96 w-full bg-slate-900 overflow-hidden">
                {images?.coverUrl ? (
                    <img src={images.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-rose-900/40 to-indigo-900/40" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/50 to-transparent" />

                {/* Optional Top Overlay (e.g. Edit Button on Dashboard) */}
                {topOverlay && (
                    <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
                        {topOverlay}
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 -mt-32 relative">
                <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                    {/* Profile Photo & Gallery Row */}
                    <div className="flex items-end gap-3 shrink-0 z-10">
                        {/* Main Profile Photo */}
                        <div
                            className="h-40 w-40 md:h-56 md:w-56 rounded-full border-4 border-[#0f111a] overflow-hidden bg-white/5 shadow-2xl shadow-indigo-500/20 cursor-pointer group relative shrink-0"
                            onClick={() => images?.profileUrl && openLightbox(0)}
                        >
                            {images?.profileUrl ? (
                                <>
                                    <img src={images.profileUrl} alt={basicInfo?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </>
                            ) : (
                                images?.gallery?.[0] ?
                                    <img src={images.gallery[0]} alt={basicInfo?.name} className="w-full h-full object-cover" /> :
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-5xl">?</div>
                            )}
                        </div>

                        {/* Mini Gallery Thumbnails */}
                        {images?.gallery && images.gallery.length > 0 && (
                            <div className="flex gap-2 mb-2 hidden sm:flex">
                                {images.gallery.slice(0, 4).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="h-16 w-16 rounded-full border-2 border-[#0f111a] overflow-hidden bg-slate-800 shadow-md hover:scale-110 transition-transform cursor-pointer relative group"
                                        onClick={() => openLightbox(idx + galleryOffset)}
                                    >
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                                {/* If more than 4 images, maybe show a counter? For now just showing up to 4 to avoid clutter */}
                                {images.gallery.length > 4 && (
                                    <div
                                        className="h-16 w-16 rounded-full border-2 border-[#0f111a] bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 transition-transform cursor-pointer"
                                        onClick={() => openLightbox(4 + galleryOffset)}
                                    >
                                        +{images.gallery.length - 4}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Basic Info Header */}
                    <div className="flex-1 pb-4 text-white drop-shadow-md min-w-0">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{basicInfo?.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-lg font-medium opacity-90 text-slate-300">
                            {age && <span>{age} years old</span>}
                            <span>•</span>
                            <span className="capitalize">{basicInfo?.gender?.join(", ")}</span>
                            <span>•</span>
                            <span>{basicInfo?.country}</span>
                        </div>
                    </div>

                    {/* Actions / Status */}
                    <div className="pb-4 shrink-0">
                        {headerActions ? headerActions : !isOwnProfile && (
                            <div className="flex gap-3">
                                <MagnetButton
                                    className={cn(
                                        "px-6 py-2 rounded-lg flex items-center justify-center font-medium transition-all text-sm",
                                        myLikeStatus === "friend"
                                            ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25 border-none"
                                            : "bg-white/5 border border-white/10 text-slate-300 hover:bg-sky-500/10 hover:text-sky-300 hover:border-sky-500/30"
                                    )}
                                    onClick={() => onToggleLike?.("friend")}
                                    strength={20}
                                >
                                    <Users className={cn("w-5 h-5 mr-2", myLikeStatus === "friend" && "fill-current")} />
                                    {myLikeStatus === "friend" ? "Friend Request Sent" : "Like as Friend"}
                                </MagnetButton>

                                <MagnetButton
                                    className={cn(
                                        "px-6 py-2 rounded-lg flex items-center justify-center font-medium transition-all text-sm",
                                        myLikeStatus === "relationship"
                                            ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 border-none"
                                            : "bg-white/5 border border-white/10 text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30"
                                    )}
                                    onClick={() => onToggleLike?.("relationship")}
                                    strength={20}
                                >
                                    <Heart className={cn("w-5 h-5 mr-2", myLikeStatus === "relationship" && "fill-current")} />
                                    {myLikeStatus === "relationship" ? "Partner Request Sent" : "Like as Partner"}
                                </MagnetButton>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Key Details Card */}
                        <TiltedCard className="w-full" tiltStrength={5} glareOpacity={0.1}>
                            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden h-full">
                                <div className="bg-gradient-to-r from-rose-500/20 to-indigo-500/20 p-4 border-b border-white/5">
                                    <h3 className="font-bold text-rose-200 uppercase tracking-widest text-sm text-center">Identity Snapshot</h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <span className="text-slate-400 text-sm font-medium">Pronouns</span>
                                        <span className="font-semibold text-slate-200">{identity?.pronouns || "-"}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <span className="text-slate-400 text-sm font-medium">Orientation</span>
                                        <div className="text-right">
                                            <div className="font-semibold text-slate-200">{identity?.sexualOrientation || "-"}</div>
                                            <div className="text-xs text-slate-500 capitalize">{identity?.romanticOrientation}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <span className="text-slate-400 text-sm font-medium">Looking For</span>
                                        <Badge variant="outline" className="capitalize bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                                            {lookingFor?.intent}
                                        </Badge>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                                        <span className="text-slate-400 text-sm font-medium">Diet</span>
                                        <span className="font-semibold text-slate-200 capitalize">{identity?.diet || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </TiltedCard>

                        {/* Lifestyle Card */}
                        <TiltedCard className="w-full" tiltStrength={5} glareOpacity={0.1}>
                            <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 h-full">
                                <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-500 rounded-full" /> Lifestyle
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {Object.entries(lifestyle || {}).map(([key, value]) => {
                                        if (key === 'interests' || !value) return null;
                                        return (
                                            <div key={key} className="flex justify-between items-center">
                                                <span className="text-slate-500 capitalize">{key}</span>
                                                <span className="font-medium text-slate-300 capitalize">{value as string}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {lifestyle?.interests && (
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interests</p>
                                        <div className="flex flex-wrap gap-2">
                                            {lifestyle.interests.split(',').map(i => i.trim()).filter(Boolean).map((interest, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-white/10 hover:bg-white/20 text-slate-300 border border-white/5">
                                                    {interest}
                                                </Badge>
                                            ))}
                                            {(!lifestyle.interests.includes(',')) && (
                                                <p className="text-sm text-slate-400">{lifestyle.interests}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TiltedCard>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-8 space-y-8">
                        {/* Looking For Detailed Section */}
                        <SpotlightCard className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 relative overflow-hidden" spotlightColor="rgba(244, 63, 94, 0.15)">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-500 to-purple-500" />
                            <h2 className="text-2xl font-bold text-slate-200 mb-6">Looking For</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                {lookingFor?.intent === 'friends' && lookingFor.friends && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-5">
                                        <h3 className="font-bold text-rose-300 mb-2">Friendship Config</h3>
                                        <p className="text-slate-400 mb-1">
                                            <span className="font-medium text-slate-300">Age Range:</span> {lookingFor.friends.ageRange[0]} - {lookingFor.friends.ageRange[1]}
                                        </p>
                                        <p className="text-slate-400">
                                            <span className="font-medium text-slate-300">Gender Prefs:</span> {lookingFor.friends.gender.join(", ") || "Any"}
                                        </p>
                                    </div>
                                )}

                                {(lookingFor?.intent === 'relationship' || lookingFor?.intent === 'both') && lookingFor?.partner && (
                                    <>
                                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-5">
                                            <h3 className="font-bold text-purple-300 mb-2">Partner Config</h3>
                                            <p className="text-slate-400 mb-1">
                                                <span className="font-medium text-slate-300">Age Range:</span> {lookingFor.partner.ageRange[0]} - {lookingFor.partner.ageRange[1]}
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Sex Desire Match</span>
                                                    <span className="font-medium text-slate-300 bg-white/5 px-2 rounded shadow-sm capitalize border border-white/5">
                                                        {formatDesire(lookingFor.partner.sexDesire)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Romance Desire Match</span>
                                                    <span className="font-medium text-slate-300 bg-white/5 px-2 rounded shadow-sm capitalize border border-white/5">
                                                        {formatDesire(lookingFor.partner.romanceDesire)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                                            <h3 className="font-bold text-slate-300 mb-2">My Stance</h3>
                                            <ul className="space-y-2 text-sm text-slate-400">
                                                <li className="flex justify-between border-b border-white/5 pb-1">
                                                    <span>Has Kids?</span> <span className="font-medium text-slate-300">{lookingFor.toggles.hasKids ? "Yes" : "No"}</span>
                                                </li>
                                                <li className="flex justify-between border-b border-white/5 pb-1">
                                                    <span>In Relationship?</span> <span className="font-medium text-slate-300">{lookingFor.toggles.isTaken ? "Yes" : "No"}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </SpotlightCard>

                        {/* Long Description Items */}
                        <div className="space-y-8">
                            {longDescription?.map((section) => (
                                <SpotlightCard key={section.id} className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10" spotlightColor="rgba(111, 207, 151, 0.15)">
                                    <h2 className="text-2xl font-bold text-slate-200 mb-4 border-b border-white/10 pb-4">{section.title}</h2>
                                    <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {section.content}
                                    </div>
                                </SpotlightCard>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
