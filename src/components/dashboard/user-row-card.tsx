import { Introduction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Heart, Users } from "lucide-react";
import Link from "next/link";
import { LikeType } from "@/lib/services/likes";
import { cn } from "@/lib/utils";

interface UserRowCardProps {
    user: Introduction | null; // The other user's profile
    type: LikeType;
    status: "pending" | "matched";
    onAction?: () => void; // Filter/Action implementation passed from parent
    actionLabel?: string;
    className?: string;
}

export function UserRowCard({ user, type, status, onAction, actionLabel, className }: UserRowCardProps) {
    if (!user) return null;

    const { basicInfo, images, uid } = user;

    // Calculate age
    const getAge = (dob?: string) => {
        if (!dob) return "?";
        return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
    };

    return (
        <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
            <CardContent className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                    {images?.profileUrl ? (
                        <img src={images.profileUrl} alt={basicInfo?.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <User className="w-8 h-8" />
                        </div>
                    )}

                    {/* Status Indicator Over Avatar */}
                    <div className={cn(
                        "absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]",
                        status === "matched" ? "bg-green-500 text-white" : "bg-slate-500 text-white"
                    )}>
                        {type === 'friend' ? <Users size={10} /> : <Heart size={10} />}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 truncate text-lg">{basicInfo?.name}</h4>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {getAge(basicInfo?.dob)} y/o
                        </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <span className="truncate">{basicInfo?.country || "Unknown Location"}</span>
                        {status === "matched" && (
                            <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-1.5 rounded">MATCHED</span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {onAction && actionLabel && (
                        <Button
                            size="sm"
                            className={cn(
                                "font-medium shadow-sm transition-colors",
                                type === 'friend'
                                    ? "bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200"
                                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                onAction();
                            }}
                        >
                            {type === "friend" && <Users className="w-4 h-4 mr-2" />}
                            {type === "relationship" && <Heart className="w-4 h-4 mr-2" />}
                            {actionLabel}
                        </Button>
                    )}

                    <Link href={`/profile/${basicInfo?.username || uid}`}>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-800">
                            View Profile <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
