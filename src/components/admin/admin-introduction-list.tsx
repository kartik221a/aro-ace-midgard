
import { useState } from "react";
import { Introduction, IntroductionStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, X, RotateCcw, AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SpotlightCard from "@/components/ui/reactbits/spotlight-card";
import MagnetButton from "@/components/ui/reactbits/magnet-button";

interface AdminIntroductionListProps {
    introductions: Introduction[];
    onUpdateStatus: (uid: string, status: IntroductionStatus, reason?: string) => Promise<void>;
    type: "pending" | "approved" | "rejected";
}

export function AdminIntroductionList({ introductions, onUpdateStatus, type }: AdminIntroductionListProps) {
    const [rejectionReason, setRejectionReason] = useState("");
    const [selectedIntro, setSelectedIntro] = useState<string | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    const handleRejectClick = (uid: string) => {
        setSelectedIntro(uid);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const confirmReject = async () => {
        if (selectedIntro) {
            await onUpdateStatus(selectedIntro, "rejected", rejectionReason);
            setIsRejectDialogOpen(false);
            setSelectedIntro(null);
        }
    };

    if (introductions.length === 0) {
        return (
            <div className="p-12 text-center border-dashed border border-white/10 bg-white/5 rounded-2xl">
                <div className="text-slate-400">No items found in this category.</div>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {introductions.map((intro, index) => (
                <SpotlightCard key={intro.uid} className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between p-6 rounded-2xl border border-white/10 bg-white/5" spotlightColor="rgba(255, 255, 255, 0.1)">
                    <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-full bg-white/5 overflow-hidden shrink-0 border border-white/10">
                            {(intro.pendingUpdate?.images?.profileUrl || intro.images.profileUrl) ? (
                                <img src={intro.pendingUpdate?.images?.profileUrl || intro.images.profileUrl} alt={intro.pendingUpdate?.basicInfo?.name || intro.basicInfo.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-600 font-bold">?</div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-xl text-white hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-2" onClick={() => window.open(`/profile/${intro.uid}`, '_blank')}>
                                    {intro.pendingUpdate?.basicInfo?.name || intro.basicInfo.name}
                                    {intro.pendingUpdate && (
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                            Edit
                                        </Badge>
                                    )}
                                </h3>
                                {type === "approved" && intro.approvedBy && (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-green-500/20 text-green-300 border-green-500/30">
                                        Approved by {intro.approvedBy}
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm text-slate-400 flex gap-2 items-center mb-2">
                                <span className="capitalize">{(intro.pendingUpdate?.basicInfo?.gender || intro.basicInfo.gender).join(", ")}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                <span>{intro.pendingUpdate?.basicInfo?.country || intro.basicInfo.country}</span>
                            </div>

                            {type === "rejected" && intro.rejectionReason && (
                                <div className="mt-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-2 rounded-md flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Reason: {intro.rejectionReason}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                        <MagnetButton className="h-9 px-3 rounded-lg border border-white/10 bg-transparent text-slate-300 hover:bg-white/10 hover:text-white flex items-center justify-center text-sm" onClick={() => window.open(`/profile/${intro.uid}`, '_blank')} strength={10}>
                            <ExternalLink className="w-4 h-4 mr-2" /> View
                        </MagnetButton>

                        {/* Actions based on type */}
                        {type === "pending" && (
                            <>
                                <MagnetButton className="h-9 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white border-none shadow-lg shadow-green-500/20 flex items-center justify-center text-sm" onClick={() => onUpdateStatus(intro.uid, "approved")} strength={10}>
                                    <Check className="w-4 h-4 mr-2" /> Approve
                                </MagnetButton>
                                <MagnetButton className="h-9 px-3 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 hover:text-red-200 flex items-center justify-center text-sm" onClick={() => handleRejectClick(intro.uid)} strength={10}>
                                    <X className="w-4 h-4 mr-2" /> Reject
                                </MagnetButton>
                            </>
                        )}

                        {type === "approved" && (
                            <MagnetButton className="h-9 px-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center text-sm" onClick={() => handleRejectClick(intro.uid)} strength={10}>
                                <X className="w-4 h-4 mr-2" /> Revoke
                            </MagnetButton>
                        )}

                        {type === "rejected" && (
                            <MagnetButton className="h-9 px-3 rounded-lg border border-white/10 bg-transparent text-slate-300 hover:bg-white/10 flex items-center justify-center text-sm" onClick={() => onUpdateStatus(intro.uid, "pending")} strength={10}>
                                <RotateCcw className="w-4 h-4 mr-2" /> Reconsider
                            </MagnetButton>
                        )}
                    </div>
                </SpotlightCard>
            ))}

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-[#0f111a] border-white/10 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-white">Reject Introduction</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Please provide a reason for rejecting this profile. This will be visible to other admins.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason" className="text-slate-300">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                className="bg-white/5 border-white/10 text-white focus:border-rose-500/50"
                                placeholder="e.g. Inappropriate images, Spam, Incomplete profile..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/5">Cancel</Button>
                        <Button variant="destructive" onClick={confirmReject} className="bg-red-600 hover:bg-red-700 text-white">Reject Profile</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
