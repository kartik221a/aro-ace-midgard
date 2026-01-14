import { Introduction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { LikeType } from "@/lib/services/likes";

interface MatchCardProps {
    profile: Introduction;
    type: LikeType;
    isMatch: boolean;
    isSent?: boolean;
    onPass?: () => void;
}

export function MatchCard({ profile, type, isMatch, isSent, onPass }: MatchCardProps) {
    const { basicInfo, images, uid } = profile;

    const getAge = (dob?: string) => {
        if (!dob) return "?";
        return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {images?.profileUrl ? (
                        <img src={images.profileUrl} alt={basicInfo?.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <User className="w-8 h-8" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 truncate">{basicInfo?.name}</h4>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {getAge(basicInfo?.dob)} y/o
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <span className="truncate">{basicInfo?.country || "Unknown Location"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isMatch && onPass && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onPass();
                            }}
                            title={isSent ? "Cancel Request" : "Pass"}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    )}

                    <Link href={`/profile/${uid}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                            View Profile <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
