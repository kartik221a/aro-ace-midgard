
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Introduction } from "@/types";
import { MapPin, User, Heart, Users } from "lucide-react";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";

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
            return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 border"><Users className="w-3 h-3 mr-1" /> Friends Only</Badge>;
        } else if (intent === "relationship") {
            return <Badge variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 border"><Heart className="w-3 h-3 mr-1" /> Relationship Only</Badge>;
        } else {
            return <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 border"><Heart className="w-3 h-3 mr-1" /> Friends & Relationship</Badge>;
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
        <Link href={`/profile/${uid}`} className="block h-full group">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col border-slate-200">
                <div className="relative h-56 bg-slate-100 overflow-hidden">
                    {images?.profileUrl ? (
                        <img
                            src={images.profileUrl}
                            alt={basicInfo?.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                            <User className="w-16 h-16" />
                        </div>
                    )}
                    <div className="absolute top-0 right-0 p-2">
                        {getLookingForBadge()}
                    </div>
                </div>

                <CardContent className="p-4 flex flex-col gap-3 flex-grow">
                    <div>
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-xl text-slate-900 truncate pr-2 group-hover:text-rose-600 transition-colors">{basicInfo?.name}</h3>
                            <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {displayAge} y/o
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 mb-2">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span className="truncate">{basicInfo?.country || "Earth"}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        {basicInfo?.gender?.map(g => (
                            <span key={g} className="text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded border border-slate-100 capitalize">
                                {g}
                            </span>
                        ))}
                    </div>
                </CardContent>


                <CardFooter className="p-4 pt-0 flex gap-2 justify-between">
                    <div className="flex gap-2 w-full">
                        {/* Friend Like (Blue) */}
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "flex-1 transition-colors",
                                myLikeStatus === "friend"
                                    ? "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800"
                                    : "text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.("friend");
                            }}
                        >
                            <Users className={cn("w-4 h-4 mr-2", myLikeStatus === "friend" && "fill-current")} />
                            Friend
                        </Button>

                        {/* Relationship Like (Red) */}
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "flex-1 transition-colors",
                                myLikeStatus === "relationship"
                                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
                                    : "text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.("relationship");
                            }}
                        >
                            <Heart className={cn("w-4 h-4 mr-2", myLikeStatus === "relationship" && "fill-current")} />
                            Partner
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
