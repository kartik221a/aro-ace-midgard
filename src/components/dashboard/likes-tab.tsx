
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LikesService, LikeType } from "@/lib/services/likes";
import { Introduction } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface IncomingLike {
    likeId: string;
    fromUserId: string;
    toUserId: string;
    type: LikeType;
    likerProfile: Introduction | null;
}

export function LikesTab() {
    const { user } = useAuth();
    const [likes, setLikes] = useState<IncomingLike[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikes = async () => {
            if (user) {
                const data = await LikesService.getIncomingLikes(user.uid);
                // @ts-ignore - quick fix for the typo in service return
                setLikes(data);
                setLoading(false);
            }
        };
        fetchLikes();
    }, [user]);

    const friendLikes = likes.filter(l => l.type === "friend");
    const partnerLikes = likes.filter(l => l.type === "relationship");

    if (loading) return <div className="text-center py-10 text-slate-500 animate-pulse">Loading requests...</div>;

    const LikeCard = ({ like }: { like: IncomingLike }) => {
        if (!like.likerProfile) return null;
        const { basicInfo, images, uid } = like.likerProfile;

        // Calculate age
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

                    <Link href={`/profile/${uid}`}>
                        <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                            View Profile <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <Tabs defaultValue="friends" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="friends" className="gap-2">
                        <Users className="w-4 h-4" />
                        Friend Requests
                        {friendLikes.length > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-sky-100 text-sky-700 hover:bg-sky-100">
                                {friendLikes.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="relationship" className="gap-2">
                        <Heart className="w-4 h-4" />
                        Partner Requests
                        {partnerLikes.length > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-rose-100 text-rose-700 hover:bg-rose-100">
                                {partnerLikes.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="friends" className="space-y-4">
                    {friendLikes.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <Users className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                            <h3 className="text-slate-600 font-medium">No friend requests yet</h3>
                            <p className="text-slate-400 text-sm">When someone likes you as a friend, they'll appear here.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {friendLikes.map(like => <LikeCard key={like.likeId} like={like} />)}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="relationship" className="space-y-4">
                    {partnerLikes.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                            <Heart className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                            <h3 className="text-slate-600 font-medium">No partner requests yet</h3>
                            <p className="text-slate-400 text-sm">When someone expresses relationship interest, they'll appear here.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {partnerLikes.map(like => <LikeCard key={like.likeId} like={like} />)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </Card>
    );
}
