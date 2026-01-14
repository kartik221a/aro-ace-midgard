
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
        return <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed">No items found in this category.</div>;
    }

    return (
        <div className="grid gap-4">
            {introductions.map((intro) => (
                <div key={intro.uid} className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden shrink-0">
                            {intro.images.profileUrl ? (
                                <img src={intro.images.profileUrl} alt={intro.basicInfo.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold">?</div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg hover:underline cursor-pointer" onClick={() => window.open(`/profile/${intro.uid}`, '_blank')}>
                                    {intro.basicInfo.name}
                                </h3>
                                {type === "approved" && intro.approvedBy && (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1 bg-green-50 text-green-700 border-green-200">
                                        Approved by {intro.approvedBy}
                                    </Badge>
                                )}
                            </div>

                            <div className="text-sm text-slate-500 flex gap-2">
                                <span>{intro.basicInfo.gender.join(", ")}</span>
                                <span>•</span>
                                <span>{intro.basicInfo.country}</span>
                            </div>

                            {type === "rejected" && intro.rejectionReason && (
                                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>Reason: {intro.rejectionReason}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/profile/${intro.uid}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" /> View
                            </a>
                        </Button>

                        {/* Actions based on type */}
                        {type === "pending" && (
                            <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(intro.uid, "approved")}>
                                    <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleRejectClick(intro.uid)}>
                                    <X className="w-4 h-4 mr-1" /> Reject
                                </Button>
                            </>
                        )}

                        {type === "approved" && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectClick(intro.uid)}>
                                <X className="w-4 h-4 mr-1" /> Revoke
                            </Button>
                        )}

                        {type === "rejected" && (
                            <Button size="sm" variant="outline" onClick={() => onUpdateStatus(intro.uid, "pending")}>
                                <RotateCcw className="w-4 h-4 mr-1" /> Reconsider
                            </Button>
                        )}
                    </div>
                </div>
            ))}

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Introduction</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this profile. This will be visible to other admins.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g. Inappropriate images, Spam, Incomplete profile..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmReject}>Reject Profile</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
