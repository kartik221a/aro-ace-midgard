import { Introduction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ArrowRight, Check, X } from "lucide-react";
import Link from "next/link";
import { LikeType } from "@/lib/services/likes";

export type MatchCardVariant = 'friend-matches' | 'friend-requests' | 'partner-matches' | 'partner-requests' | 'sent-requests';

interface MatchCardProps {
    profile: Introduction;
    type: LikeType;
    isMatch: boolean;
    isSent?: boolean;
    onPass?: () => void;
    variant: MatchCardVariant;
}

export function MatchCard({ profile, type, isMatch, isSent, onPass, variant }: MatchCardProps) {
    const { basicInfo, images, uid } = profile;

    const getAge = (dob?: string) => {
        if (!dob) return "?";
        return Math.abs(new Date(Date.now() - new Date(dob).getTime()).getUTCFullYear() - 1970);
    };

    const themeColors = {
        'friend-matches': {
            bg: 'bg-blue-600/10',
            border: 'border-blue-600/30',
            text: 'text-blue-400',
            glow: 'shadow-blue-900/20',
            button: 'border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
        },
        'friend-requests': {
            bg: 'bg-sky-400/10',
            border: 'border-sky-400/30',
            text: 'text-sky-400',
            glow: 'shadow-sky-900/20',
            button: 'border-sky-400/30 text-sky-400 hover:bg-sky-400/20'
        },
        'partner-matches': {
            bg: 'bg-rose-600/10',
            border: 'border-rose-600/30',
            text: 'text-rose-400',
            glow: 'shadow-rose-900/20',
            button: 'border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
        },
        'partner-requests': {
            bg: 'bg-pink-400/10',
            border: 'border-pink-400/30',
            text: 'text-pink-400',
            glow: 'shadow-pink-900/20',
            button: 'border-pink-400/30 text-pink-400 hover:bg-pink-400/20'
        },
        'sent-requests': {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            text: 'text-yellow-500',
            glow: 'shadow-yellow-900/20',
            button: 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20'
        }
    };

    const currentTheme = themeColors[variant];

    return (
        <Card className={cn(
            "overflow-hidden transition-all duration-300 border backdrop-blur-md",
            currentTheme.bg,
            currentTheme.border,
            "hover:shadow-lg",
            currentTheme.glow
        )}>
            <CardContent className="p-5 flex flex-col items-center gap-4 text-center">
                {/* Round Profile Photo */}
                <div className={cn(
                    "h-24 w-24 rounded-full overflow-hidden border-2 shrink-0",
                    currentTheme.border
                )}>
                    {images?.profileUrl ? (
                        <img src={images.profileUrl} alt={basicInfo?.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-400">
                            <User className="w-10 h-10" />
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h4 className="text-xl font-bold text-white truncate max-w-[200px]">{basicInfo?.name}</h4>
                    <div className="flex items-center justify-center gap-2">
                        <span className={cn("text-sm font-semibold px-2 py-0.5 rounded-full bg-white/5", currentTheme.text)}>
                            {getAge(basicInfo?.dob)} y/o
                        </span>
                        {basicInfo?.country && (
                            <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                {basicInfo.country}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full mt-2">
                    <Link href={`/profile/${basicInfo?.username || uid}`} className="flex-1">
                        <Button variant="outline" size="sm" className={cn("w-full h-10 rounded-xl transition-colors", currentTheme.button)}>
                            View Profile <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>

                    {!isMatch && onPass && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
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
                </div>
            </CardContent>
        </Card>
    );
}

import { cn } from "@/lib/utils";
