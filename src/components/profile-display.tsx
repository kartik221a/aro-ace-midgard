
import { Introduction } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode, useState } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";

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
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Lightbox Overlay */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                    <button onClick={closeLightbox} className="absolute top-4 right-4 text-white hover:text-rose-400 p-2">
                        <X size={32} />
                    </button>

                    <button onClick={prevImage} className="absolute left-4 text-white hover:text-rose-400 p-2">
                        <ChevronLeft size={48} />
                    </button>

                    <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <img
                            src={allImages[lightboxIndex]}
                            alt="Lightbox view"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    <button onClick={nextImage} className="absolute right-4 text-white hover:text-rose-400 p-2">
                        <ChevronRight size={48} />
                    </button>

                    <div className="absolute bottom-4 text-white/70 text-sm font-medium">
                        {lightboxIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}

            {/* Cover Image */}
            <div className="relative h-64 md:h-96 w-full bg-slate-200 overflow-hidden">
                {images?.coverUrl ? (
                    <img src={images.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-rose-100 to-indigo-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

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
                            className="h-40 w-40 md:h-56 md:w-56 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl cursor-pointer group relative shrink-0"
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
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-5xl">?</div>
                            )}
                        </div>

                        {/* Mini Gallery Thumbnails */}
                        {images?.gallery && images.gallery.length > 0 && (
                            <div className="flex gap-2 mb-2 hidden sm:flex">
                                {images.gallery.slice(0, 4).map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="h-16 w-16 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-md hover:scale-110 transition-transform cursor-pointer relative group"
                                        onClick={() => openLightbox(idx + galleryOffset)}
                                    >
                                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                                {/* If more than 4 images, maybe show a counter? For now just showing up to 4 to avoid clutter */}
                                {images.gallery.length > 4 && (
                                    <div
                                        className="h-16 w-16 rounded-full border-2 border-white bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-md hover:scale-110 transition-transform cursor-pointer"
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
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 truncate">{basicInfo?.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-lg font-medium opacity-90">
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
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className={cn(
                                        "bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm transition-colors",
                                        myLikeStatus === "friend"
                                            ? "text-sky-600 border-sky-300 bg-sky-50 hover:bg-sky-100"
                                            : "text-slate-600 hover:text-sky-600 hover:bg-sky-50"
                                    )}
                                    onClick={() => onToggleLike?.("friend")}
                                >
                                    <Users className={cn("w-5 h-5 mr-2", myLikeStatus === "friend" && "fill-current")} />
                                    {myLikeStatus === "friend" ? "Friend Request Sent" : "Like as Friend"}
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className={cn(
                                        "bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm transition-colors",
                                        myLikeStatus === "relationship"
                                            ? "text-rose-600 border-rose-300 bg-rose-50 hover:bg-rose-100"
                                            : "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                                    )}
                                    onClick={() => onToggleLike?.("relationship")}
                                >
                                    <Heart className={cn("w-5 h-5 mr-2", myLikeStatus === "relationship" && "fill-current")} />
                                    {myLikeStatus === "relationship" ? "Partner Request Sent" : "Like as Partner"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Key Details Card */}
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <div className="bg-rose-50 p-4 border-b border-rose-100">
                                <h3 className="font-bold text-rose-700 uppercase tracking-widest text-sm text-center">Identity Snapshot</h3>
                            </div>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <span className="text-slate-500 text-sm font-medium">Pronouns</span>
                                        <span className="font-semibold text-slate-800">{identity?.pronouns || "-"}</span>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <span className="text-slate-500 text-sm font-medium">Orientation</span>
                                        <div className="text-right">
                                            <div className="font-semibold text-slate-800">{identity?.sexualOrientation || "-"}</div>
                                            <div className="text-xs text-slate-400 capitalize">{identity?.romanticOrientation}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <span className="text-slate-500 text-sm font-medium">Looking For</span>
                                        <Badge variant="outline" className="capitalize bg-indigo-50 text-indigo-700 border-indigo-200">
                                            {lookingFor?.intent}
                                        </Badge>
                                    </div>
                                    <div className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <span className="text-slate-500 text-sm font-medium">Diet</span>
                                        <span className="font-semibold text-slate-800 capitalize">{identity?.diet || "-"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lifestyle Card */}
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-500 rounded-full" /> Lifestyle
                                </h3>
                                <div className="space-y-3 text-sm">
                                    {Object.entries(lifestyle || {}).map(([key, value]) => {
                                        if (key === 'interests' || !value) return null;
                                        return (
                                            <div key={key} className="flex justify-between items-center">
                                                <span className="text-slate-500 capitalize">{key}</span>
                                                <span className="font-medium text-slate-800 capitalize">{value as string}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {lifestyle?.interests && (
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interests</p>
                                        <div className="flex flex-wrap gap-2">
                                            {lifestyle.interests.split(',').map(i => i.trim()).filter(Boolean).map((interest, idx) => (
                                                <Badge key={idx} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                                                    {interest}
                                                </Badge>
                                            ))}
                                            {(!lifestyle.interests.includes(',')) && (
                                                <p className="text-sm text-slate-600">{lifestyle.interests}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="md:col-span-8 space-y-8">
                        {/* Looking For Detailed Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-rose-500 to-purple-500" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Looking For</h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                {lookingFor?.intent === 'friends' && lookingFor.friends && (
                                    <div className="bg-rose-50 rounded-lg p-5">
                                        <h3 className="font-bold text-rose-800 mb-2">Friendship Config</h3>
                                        <p className="text-slate-700 mb-1">
                                            <span className="font-medium">Age Range:</span> {lookingFor.friends.ageRange[0]} - {lookingFor.friends.ageRange[1]}
                                        </p>
                                        <p className="text-slate-700">
                                            <span className="font-medium">Gender Prefs:</span> {lookingFor.friends.gender.join(", ") || "Any"}
                                        </p>
                                    </div>
                                )}

                                {(lookingFor?.intent === 'relationship' || lookingFor?.intent === 'both') && lookingFor?.partner && (
                                    <>
                                        <div className="bg-purple-50 rounded-lg p-5">
                                            <h3 className="font-bold text-purple-800 mb-2">Partner Config</h3>
                                            <p className="text-slate-700 mb-1">
                                                <span className="font-medium">Age Range:</span> {lookingFor.partner.ageRange[0]} - {lookingFor.partner.ageRange[1]}
                                            </p>
                                            <div className="mt-3 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Sex Desire Match</span>
                                                    <span className="font-medium text-slate-800 bg-white px-2 rounded shadow-sm capitalize">
                                                        {formatDesire(lookingFor.partner.sexDesire)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Romance Desire Match</span>
                                                    <span className="font-medium text-slate-800 bg-white px-2 rounded shadow-sm capitalize">
                                                        {formatDesire(lookingFor.partner.romanceDesire)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-5">
                                            <h3 className="font-bold text-slate-700 mb-2">My Stance</h3>
                                            <ul className="space-y-2 text-sm text-slate-600">
                                                <li className="flex justify-between border-b border-slate-200 pb-1">
                                                    <span>Has Kids?</span> <span className="font-medium">{lookingFor.toggles.hasKids ? "Yes" : "No"}</span>
                                                </li>
                                                <li className="flex justify-between border-b border-slate-200 pb-1">
                                                    <span>In Relationship?</span> <span className="font-medium">{lookingFor.toggles.isTaken ? "Yes" : "No"}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Long Description Items */}
                        <div className="space-y-8">
                            {longDescription?.map((section) => (
                                <section key={section.id} className="bg-white rounded-xl shadow-sm p-8 border border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-4">{section.title}</h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {section.content}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
