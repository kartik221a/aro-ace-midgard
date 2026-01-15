import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Introduction } from "@/types";
import { MapPin, User, Heart, Users } from "lucide-react";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import MagnetButton from "@/components/ui/reactbits/magnet-button";

interface IntroductionCardProps {
    introduction: Introduction;
    myLikeStatus?: LikeType | null;
    onToggleLike?: (type: LikeType) => void;
}

export function IntroductionCard({ introduction, myLikeStatus, onToggleLike }: IntroductionCardProps) {
    const { basicInfo, identity, lookingFor, images, uid } = introduction;

    // Helper to determine "Looking For" badge
    const getLookingForBadge = () => {
        const intent = lookingFor?.intent;
        if (intent === "friends") {
            return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-md"><Users className="w-3 h-3 mr-1" /> Friends</Badge>;
        } else if (intent === "relationship") {
            return <Badge variant="secondary" className="bg-rose-500/20 text-rose-300 border-rose-500/30 backdrop-blur-md"><Heart className="w-3 h-3 mr-1" /> Partner</Badge>;
        } else {
            return <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 backdrop-blur-md"><Heart className="w-3 h-3 mr-1" /> All</Badge>;
        }
    };

    const calculateAge = (dobString?: string) => {
        if (!dobString) return "?";
        const dob = new Date(dobString);
        const diff_ms = Date.now() - dob.getTime();
        const age_dt = new Date(diff_ms);
        return Math.abs(age_dt.getUTCFullYear() - 1970);
    };

    const displayAge = calculateAge(basicInfo?.dob);

    return (
        <Link href={`/profile/${uid}`} className="block h-full group/card relative">
            <SpotlightCard className="h-full flex flex-col p-0 overflow-hidden border border-white/10 bg-[#0f111a]/80 backdrop-blur-md rounded-3xl transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] hover:-translate-y-2" spotlightColor="rgba(167, 139, 250, 0.2)">
                <div className="relative h-64 bg-slate-900/50 overflow-hidden">
                    {images?.profileUrl ? (
                        <img
                            src={images.profileUrl}
                            alt={basicInfo?.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 group-hover/card:rotate-2"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-600">
                            <User className="w-16 h-16 opacity-50" />
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-transparent opacity-90" />

                    {/* Floating Badge */}
                    <div className="absolute top-3 right-3 transform transition-transform duration-300 group-hover/card:translate-x-1">
                        {getLookingForBadge()}
                    </div>
                </div>

                <div className="p-5 flex flex-col gap-3 flex-grow">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-xl text-white truncate pr-2">{basicInfo?.name}</h3>
                            <span className="text-sm font-semibold text-slate-400 bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap border border-white/5">
                                {displayAge} y/o
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-400 mb-3">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            <span className="truncate">{basicInfo?.country || "Earth"}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
                        {basicInfo?.gender?.slice(0, 3).map(g => ( // Limit to 3 tags to prevent overflow
                            <span key={g} className="text-xs px-2 py-1 bg-white/5 text-slate-300 rounded border border-white/10 capitalize">
                                {g}
                            </span>
                        ))}
                        {(basicInfo?.gender?.length || 0) > 3 && (
                            <span className="text-xs px-2 py-1 bg-white/5 text-slate-400 rounded border border-white/10">+{basicInfo!.gender.length - 3}</span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto pt-2 border-t border-white/5">
                        {/* Friend Like */}
                        <MagnetButton
                            className={cn(
                                "flex-1 h-9 px-0 text-xs rounded-lg flex items-center justify-center transition-all",
                                myLikeStatus === "friend"
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-none shadow-lg shadow-cyan-500/25"
                                    : "bg-transparent border border-white/10 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30"
                            )}
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.("friend");
                            }}
                            strength={10}
                        >
                            <Users className={cn("w-3.5 h-3.5 mr-1.5", myLikeStatus === "friend" && "fill-current")} />
                            {myLikeStatus === "friend" ? "Friend" : "Friend"}
                        </MagnetButton>

                        {/* Relationship Like */}
                        <MagnetButton
                            className={cn(
                                "flex-1 h-9 px-0 text-xs rounded-lg flex items-center justify-center transition-all",
                                myLikeStatus === "relationship"
                                    ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none shadow-lg shadow-pink-500/25"
                                    : "bg-transparent border border-white/10 text-slate-300 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30"
                            )}
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.("relationship");
                            }}
                            strength={10}
                        >
                            <Heart className={cn("w-3.5 h-3.5 mr-1.5", myLikeStatus === "relationship" && "fill-current")} />
                            {myLikeStatus === "relationship" ? "Partner" : "Partner"}
                        </MagnetButton>
                    </div>
                </div>
            </SpotlightCard>
        </Link>
    );
}
