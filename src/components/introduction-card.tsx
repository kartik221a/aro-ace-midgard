import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Introduction } from "@/types";
import { MapPin, User, Heart, Users, ExternalLink } from "lucide-react";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";
import MagnetButton from "@/components/ui/reactbits/magnet-button";
import TiltedCard from "@/components/ui/reactbits/tilted-card";
import StarBorder from "@/components/ui/reactbits/star-border";
import ShinyText from "@/components/ui/reactbits/shiny-text";

interface IntroductionCardProps {
    introduction: Introduction;
    myLikeStatus?: LikeType | null;
    matchStatus?: LikeType | null;
    onToggleLike?: (type: LikeType) => void;
}

export function IntroductionCard({ introduction, myLikeStatus, matchStatus, onToggleLike }: IntroductionCardProps) {
    const { basicInfo, identity, lookingFor, images, uid } = introduction;

    // Helper to determine "Looking For" badge
    const getLookingForBadge = () => {
        const intent = lookingFor?.intent;
        if (intent === "friends") {
            return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-md px-3 py-1"><Users className="w-3.5 h-3.5 mr-1.5" /> Friends</Badge>;
        } else if (intent === "relationship") {
            return <Badge variant="secondary" className="bg-rose-500/20 text-rose-300 border-rose-500/30 backdrop-blur-md px-3 py-1"><Heart className="w-3.5 h-3.5 mr-1.5" /> Partner</Badge>;
        } else {
            return <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 backdrop-blur-md px-3 py-1"><Heart className="w-3.5 h-3.5 mr-1.5" /> Relationship and Friends</Badge>;
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
        <div className="h-full">
            <TiltedCard tiltStrength={12} scaleOnHover={1.03}>
                <StarBorder
                    as="div"
                    color="#a855f7"
                    speed="6s"
                    thickness={1}
                    className="h-full rounded-3xl"
                    innerClassName="h-full flex flex-col p-0 overflow-hidden bg-[#0f111a]/95 backdrop-blur-2xl rounded-[23px] transition-all duration-500 border border-white/5"
                >
                    <Link href={`/profile/${uid}`} className="block h-full group/card relative">
                        <div className="relative h-64 bg-slate-900/50 overflow-hidden">
                            {images?.profileUrl ? (
                                <img
                                    src={images.profileUrl}
                                    alt={basicInfo?.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-600">
                                    <User className="w-16 h-16 opacity-30" />
                                </div>
                            )}

                            {/* Premium Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-[#0f111a]/20 to-transparent opacity-90" />

                            {/* Top Overlay for Name visibility if needed */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

                            {/* Floating Badge */}
                            <div className="absolute top-4 right-4 z-20">
                                {getLookingForBadge()}
                            </div>

                            {/* View Profile Hint */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-500 translate-y-4 group-hover/card:translate-y-0">
                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-sm font-medium flex items-center gap-2">
                                    View Profile <ExternalLink className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-4 flex-grow relative z-10">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-2xl text-white truncate pr-2">
                                        <ShinyText
                                            text={basicInfo?.name || "Member"}
                                            disabled={false}
                                            speed={3}
                                            className="font-bold"
                                            color="#ffffff"
                                            shineColor="#a855f7"
                                        />
                                    </h3>
                                    <span className="text-sm font-bold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full whitespace-nowrap border border-purple-500/20">
                                        {displayAge} y/o
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-slate-400">
                                    <MapPin className="w-4 h-4 mr-1.5 text-purple-400" />
                                    <span className="truncate">{basicInfo?.country || "Earth"}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {basicInfo?.gender?.slice(0, 2).map(g => (
                                    <span key={g} className="text-[10px] tracking-wider uppercase px-2.5 py-1 bg-white/5 text-slate-400 rounded-md border border-white/10 font-semibold">
                                        {g}
                                    </span>
                                ))}
                                {(basicInfo?.gender?.length || 0) > 2 && (
                                    <span className="text-[10px] px-2.5 py-1 bg-white/5 text-slate-500 rounded-md border border-white/10 font-semibold">+{basicInfo!.gender.length - 2}</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-white/5">
                                {/* Friend Like */}
                                <MagnetButton
                                    className={cn(
                                        "flex-1 h-10 px-0 text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-300",
                                        myLikeStatus === "friend"
                                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-lg shadow-purple-900/40"
                                            : "bg-[#1a1d2d] border border-white/5 text-slate-400 hover:border-purple-500/40 hover:text-purple-300 hover:bg-purple-500/5"
                                    )}
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onToggleLike?.("friend");
                                    }}
                                    strength={15}
                                >
                                    <Users className={cn("w-4 h-4 mr-2", myLikeStatus === "friend" && "fill-current animate-pulse")} />
                                    {matchStatus === "friend" ? "You are Friends" : "Friend"}
                                </MagnetButton>

                                {/* Relationship Like */}
                                <MagnetButton
                                    className={cn(
                                        "flex-1 h-10 px-0 text-xs font-bold rounded-xl flex items-center justify-center transition-all duration-300",
                                        myLikeStatus === "relationship"
                                            ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none shadow-lg shadow-rose-900/40"
                                            : "bg-[#1a1d2d] border border-white/5 text-slate-400 hover:border-rose-500/40 hover:text-rose-300 hover:bg-rose-500/5"
                                    )}
                                    onClick={(e: React.MouseEvent) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onToggleLike?.("relationship");
                                    }}
                                    strength={15}
                                >
                                    <Heart className={cn("w-4 h-4 mr-2", myLikeStatus === "relationship" && "fill-current animate-bounce")} />
                                    {matchStatus === "relationship" ? "You are Partners" : "Partner"}
                                </MagnetButton>
                            </div>
                        </div>
                    </Link>
                </StarBorder>
            </TiltedCard>
        </div>
    );
}
