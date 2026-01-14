"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth-context";
import { Introduction, LongDescriptionSection } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/ui/tag-input";
import { ImageUploader } from "./image-uploader";
import * as C from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Helper to convert string array to Options
const toOptions = (arr: string[]): Option[] => arr.map(s => ({ label: s, value: s }));

const DESIRE_SCALE = ["repulsed", "averse", "indifferent", "favourable", "desired"];

const getDesireRange = (selected: string[] | undefined): number[] => {
    if (!selected || selected.length === 0) return [0, 4]; // Default to full range if empty or not set
    const indices = selected.map(s => DESIRE_SCALE.indexOf(s)).filter(i => i !== -1);
    if (indices.length === 0) return [0, 4];
    return [Math.min(...indices), Math.max(...indices)];
};

const getDesireOptionsFromRange = (range: number[]): string[] => {
    const [min, max] = range;
    return DESIRE_SCALE.slice(min, max + 1);
};

const getDesireLabel = (currentRange: number[]) => {
    const start = DESIRE_SCALE[currentRange[0]];
    const end = DESIRE_SCALE[currentRange[1]];
    if (start === end) return start;
    return `${start} - ${end}`;
};

const PHASES = [
    "Images", "Basic Info", "Identity Details", "Looking For", "Lifestyle", "Long Description"
];

interface PhasedIntroductionFormProps {
    initialData?: Introduction;
    onSuccess?: () => void;
}

export function PhasedIntroductionForm({ initialData, onSuccess }: PhasedIntroductionFormProps) {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [activePhase, setActivePhase] = useState(0);
    const [saving, setSaving] = useState(false);

    // Initial State
    const [data, setData] = useState<Partial<Introduction>>(() => initialData || {
        images: { gallery: [] },
        basicInfo: { name: "", gender: [] },
        identity: { ethnicity: [], languages: [], height: { ft: "0", in: "0", cm: 0 } },
        lookingFor: {
            intent: "friends",
            friends: { ageRange: [18, 60], gender: [] },
            personal: {},
            partner: { ageRange: [18, 60], gender: [], sexDesire: [], romanceDesire: [] },
            toggles: { hasKids: false, isTaken: false }
        },
        lifestyle: {},
        longDescription: [{ id: "about_me", title: "About Me", content: "" }]
    });

    // Update local state if initialData changes (e.g. re-fetching or switching modes)
    useEffect(() => {
        if (initialData) {
            setData(initialData);
        }
    }, [initialData]);

    // Height Calculation Effect
    useEffect(() => {
        if (data.identity?.height) {
            const ft = parseInt(data.identity.height.ft) || 0;
            const inch = parseInt(data.identity.height.in) || 0;
            const cm = Math.round((ft * 30.48) + (inch * 2.54));
            if (cm !== data.identity.height.cm) {
                setData(prev => ({
                    ...prev,
                    identity: { ...prev.identity!, height: { ...prev.identity!.height!, cm } }
                }));
            }
        }
    }, [data.identity?.height?.ft, data.identity?.height?.in]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleSave = async (draft = true) => {
        if (!user || !db) return;
        setSaving(true);
        try {
            const isAdmin = userData?.role === "admin";
            // If admin is "submitting" (not draft), status is approved. Everyone else is pending.
            const status = draft ? (userData?.role === "admin" ? "approved" : "pending") : (userData?.role === "admin" ? "approved" : "pending");

            await setDoc(doc(db, "introductions", user.uid), {
                ...data,
                updatedAt: serverTimestamp(),
                createdAt: data.createdAt || serverTimestamp(), // Keep original createdAt if editing
                uid: user.uid,
                status: status
            }, { merge: true });

            if (!draft && onSuccess) {
                onSuccess();
            } else if (!draft) {
                // Fallback if no onSuccess provided (though dashboard calls it)
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error saving introduction:", error);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
                {PHASES.map((phase, idx) => (
                    <button
                        key={phase}
                        onClick={() => setActivePhase(idx)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activePhase === idx
                            ? "bg-rose-50 text-rose-900 border-l-4 border-rose-500"
                            : "hover:bg-slate-50 text-slate-600"
                            }`}
                    >
                        {idx + 1}. {phase}
                    </button>
                ))}

                <div className="mt-8 flex flex-col gap-2">
                    <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
                        {saving ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button onClick={() => handleSave(false)} disabled={saving} className="bg-rose-500 hover:bg-rose-600">
                        {saving ? "Submitting..." : (userData?.role === "admin" ? "Publish (Admin)" : "Submit for Review")}
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold mb-6">{PHASES[activePhase]}</h2>

                        {/* PHASE 1: IMAGES */}
                        {activePhase === 0 && (
                            <div className="space-y-6">
                                <div>
                                    <Label>Profile Gallery (Main + 4 extras)</Label>
                                    <ImageUploader
                                        images={data.images?.gallery || []}
                                        onChange={(imgs) => setData(prev => ({
                                            ...prev,
                                            images: {
                                                ...prev.images!,
                                                gallery: imgs,
                                                profileUrl: imgs[0] || "" // First image is always main profile
                                            }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <Label>Cover Photo</Label>
                                    <ImageUploader
                                        images={data.images?.coverUrl ? [data.images.coverUrl] : []}
                                        onChange={(imgs) => setData(prev => ({ ...prev, images: { ...prev.images!, coverUrl: imgs[0] || "" } }))}
                                        maxImages={1}
                                        showMainLabel={false}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">A wide photo for behind your profile.</p>
                                </div>
                            </div>
                        )}

                        {/* PHASE 2: BASIC INFO */}
                        {activePhase === 1 && (
                            <div className="space-y-4 max-w-lg">
                                <div>
                                    <Label>Display Name</Label>
                                    <Input
                                        value={data.basicInfo?.name || ""}
                                        onChange={(e) => setData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo!, name: e.target.value } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Date of Birth</Label>
                                    <Input
                                        type="date"
                                        value={data.basicInfo?.dob || ""}
                                        onChange={(e) => setData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo!, dob: e.target.value } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Country</Label>
                                    <Input
                                        placeholder="Type to search..."
                                        value={data.basicInfo?.country || ""}
                                        onChange={(e) => setData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo!, country: e.target.value } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Gender (Multi-select)</Label>
                                    <MultiSelect
                                        options={toOptions(C.GENDER_OPTIONS)}
                                        selected={data.basicInfo?.gender || []}
                                        onChange={(val) => setData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo!, gender: val } }))}
                                    />
                                </div>
                            </div>
                        )}

                        {/* PHASE 3: IDENTITY */}
                        {activePhase === 2 && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Pronouns</Label>
                                    <Select value={data.identity?.pronouns} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, pronouns: v } }))}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>{C.PRONOUN_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Ethnicity</Label>
                                    <MultiSelect
                                        options={toOptions(C.ETHNICITY_OPTIONS)}
                                        selected={data.identity?.ethnicity || []}
                                        onChange={(val) => setData(prev => ({ ...prev, identity: { ...prev.identity!, ethnicity: val } }))}
                                    />
                                </div>
                                <div>
                                    <Label>Sexual Orientation</Label>
                                    <Select value={data.identity?.sexualOrientation} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, sexualOrientation: v } }))}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>{C.SEXUAL_ORIENTATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Romantic Orientation</Label>
                                    <Select value={data.identity?.romanticOrientation} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, romanticOrientation: v } }))}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>{C.ROMANTIC_ORIENTATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Diet</Label>
                                    <Select value={data.identity?.diet} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, diet: v } }))}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>{C.DIET_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Build</Label>
                                    <Select value={data.identity?.build} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, build: v } }))}>
                                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                        <SelectContent>{C.BUILD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label>Height</Label>
                                    <div className="flex items-center gap-4 mt-1">
                                        <Select value={data.identity?.height?.ft} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, height: { ...prev.identity!.height!, ft: v } } }))}>
                                            <SelectTrigger className="w-24"><SelectValue placeholder="Ft" /></SelectTrigger>
                                            <SelectContent>{Array.from({ length: 10 }).map((_, i) => <SelectItem key={i} value={i.toString()}>{i} ft</SelectItem>)}</SelectContent>
                                        </Select>
                                        <Select value={data.identity?.height?.in} onValueChange={(v) => setData(prev => ({ ...prev, identity: { ...prev.identity!, height: { ...prev.identity!.height!, in: v } } }))}>
                                            <SelectTrigger className="w-24"><SelectValue placeholder="In" /></SelectTrigger>
                                            <SelectContent>{Array.from({ length: 12 }).map((_, i) => <SelectItem key={i} value={i.toString()}>{i} in</SelectItem>)}</SelectContent>
                                        </Select>
                                        <div className="text-sm text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-md">
                                            {data.identity?.height?.cm || 0} cm
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Label>Languages</Label>
                                    <TagInput
                                        value={data.identity?.languages || []}
                                        onChange={(val) => setData(prev => ({ ...prev, identity: { ...prev.identity!, languages: val } }))}
                                        placeholder="Type language and press Enter..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* PHASE 4: LOOKING FOR */}
                        {activePhase === 3 && (
                            <div className="space-y-8">
                                <div>
                                    <Label className="text-lg">I am here for...</Label>
                                    <Select
                                        value={data.lookingFor?.intent}
                                        onValueChange={(v: any) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, intent: v } }))}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{C.INTENT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                {(data.lookingFor?.intent === "relationship" || data.lookingFor?.intent === "both") && (
                                    <>
                                        {/* ME IF IN RELATIONSHIP */}
                                        <div className="space-y-4 border-t pt-6">
                                            <h3 className="text-xl font-bold text-rose-600 bg-rose-50 p-2 inline-block rounded-md">ME IF IN RELATIONSHIP</h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div><Label>Desire for Sex</Label><Select value={data.lookingFor?.personal?.sexDesire} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, sexDesire: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.DESIRE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>Desire for Romance</Label><Select value={data.lookingFor?.personal?.romanceDesire} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, romanceDesire: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.DESIRE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>Long Distance</Label><Select value={data.lookingFor?.personal?.longDistance} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, longDistance: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.LONG_DISTANCE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>QPR (Queer Platonic)</Label><Select value={data.lookingFor?.personal?.qpr} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, qpr: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.QPR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>Polyamory</Label><Select value={data.lookingFor?.personal?.polyamory} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, polyamory: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.POLYAMORY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>Kids</Label><Select value={data.lookingFor?.personal?.kids} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, kids: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.KIDS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                                <div><Label>Marriage</Label><Select value={data.lookingFor?.personal?.marriage} onValueChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, personal: { ...prev.lookingFor!.personal, marriage: v } } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.MARRIAGE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                            </div>
                                        </div>

                                        {/* MY PREFERENCE FOR A PARTNER */}
                                        <div className="space-y-4 border-t pt-6">
                                            <h3 className="text-xl font-bold text-rose-600 bg-rose-50 p-2 inline-block rounded-md">MY PREFERENCE FOR A PARTNER</h3>
                                            <div className="space-y-6">
                                                <div>
                                                    <Label>Age Range ({data.lookingFor?.partner?.ageRange?.[0] || 18} - {data.lookingFor?.partner?.ageRange?.[1] || 60})</Label>
                                                    <Slider
                                                        min={18} max={60} step={1} minStepsBetweenThumbs={1}
                                                        value={data.lookingFor?.partner?.ageRange || [18, 60]}
                                                        onValueChange={(v: any) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, partner: { ...prev.lookingFor!.partner!, ageRange: v } } }))}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div><Label>Interested In (Genders)</Label><MultiSelect options={toOptions(C.GENDER_OPTIONS)} selected={data.lookingFor?.partner?.gender || []} onChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, partner: { ...prev.lookingFor!.partner!, gender: v } } }))} /></div>

                                                <div>
                                                    <Label>Partner's Desire for Sex ({getDesireLabel(getDesireRange(data.lookingFor?.partner?.sexDesire))})</Label>
                                                    <Slider
                                                        min={0} max={4} step={1} minStepsBetweenThumbs={0}
                                                        value={getDesireRange(data.lookingFor?.partner?.sexDesire)}
                                                        onValueChange={(v: any) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, partner: { ...prev.lookingFor!.partner!, sexDesire: getDesireOptionsFromRange(v) } } }))}
                                                        className="mt-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                                                        <span>Repulsed</span>
                                                        <span>Desired</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label>Partner's Desire for Romance ({getDesireLabel(getDesireRange(data.lookingFor?.partner?.romanceDesire))})</Label>
                                                    <Slider
                                                        min={0} max={4} step={1} minStepsBetweenThumbs={0}
                                                        value={getDesireRange(data.lookingFor?.partner?.romanceDesire)}
                                                        onValueChange={(v: any) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, partner: { ...prev.lookingFor!.partner!, romanceDesire: getDesireOptionsFromRange(v) } } }))}
                                                        className="mt-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                                                        <span>Repulsed</span>
                                                        <span>Desired</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4 mt-4 p-4 bg-slate-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="hasKids" className="text-base">I already have children</Label>
                                                    <Switch id="hasKids" checked={data.lookingFor?.toggles?.hasKids} onCheckedChange={(c) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, toggles: { ...prev.lookingFor!.toggles!, hasKids: c } } }))} />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="isTaken" className="text-base">I am currently in a relationship</Label>
                                                    <Switch id="isTaken" checked={data.lookingFor?.toggles?.isTaken} onCheckedChange={(c) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, toggles: { ...prev.lookingFor!.toggles!, isTaken: c } } }))} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(data.lookingFor?.intent === "friends" || data.lookingFor?.intent === "both") && (
                                    <div className="space-y-4 border-t pt-6">
                                        <h3 className="text-xl font-bold text-rose-600 bg-rose-50 p-2 inline-block rounded-md">FRIENDSHIP PREFERENCES</h3>
                                        <div>
                                            <Label>Age Range ({data.lookingFor?.friends?.ageRange?.[0] || 18} - {data.lookingFor?.friends?.ageRange?.[1] || 60})</Label>
                                            <Slider
                                                min={18} max={60} step={1} minStepsBetweenThumbs={1}
                                                value={data.lookingFor?.friends?.ageRange || [18, 60]}
                                                onValueChange={(v: any) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, friends: { ...prev.lookingFor!.friends!, ageRange: v } } }))}
                                                className="mt-2"
                                            />
                                        </div>
                                        <div><Label>Interested In (Genders)</Label><MultiSelect options={toOptions(C.GENDER_OPTIONS)} selected={data.lookingFor?.friends?.gender || []} onChange={(v) => setData(prev => ({ ...prev, lookingFor: { ...prev.lookingFor!, friends: { ...prev.lookingFor!.friends!, gender: v } } }))} /></div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PHASE 5: LIFESTYLE */}
                        {activePhase === 4 && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><Label>Education</Label><Select value={data.lifestyle?.education} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, education: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.EDUCATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Occupation</Label><Input value={data.lifestyle?.occupation || ""} onChange={(e) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, occupation: e.target.value } }))} placeholder="What do you do?" /></div>

                                <div className="md:col-span-2 border-t my-2" />

                                <div><Label>Alcohol</Label><Select value={data.lifestyle?.alcohol} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, alcohol: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.ALCOHOL_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Smoke</Label><Select value={data.lifestyle?.smoke} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, smoke: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.SMOKE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Cannabis</Label><Select value={data.lifestyle?.cannabis} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, cannabis: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.CANNABIS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Drugs</Label><Select value={data.lifestyle?.drugs} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, drugs: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.DRUGS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>

                                <div className="md:col-span-2 border-t my-2" />

                                <div><Label>Pets</Label><Select value={data.lifestyle?.pets} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, pets: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.PETS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Religion</Label><Select value={data.lifestyle?.religion} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, religion: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.RELIGION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>
                                <div><Label>Political Beliefs</Label><Select value={data.lifestyle?.politics} onValueChange={(v) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, politics: v } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{C.POLITICS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>

                                <div className="md:col-span-2">
                                    <Label>Interests</Label>
                                    <Textarea value={data.lifestyle?.interests || ""} onChange={(e) => setData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle!, interests: e.target.value } }))} placeholder="List your interests here..." />
                                </div>
                            </div>
                        )}

                        {/* PHASE 6: LONG DESCRIPTION */}
                        {activePhase === 5 && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Long Description</h3>
                                        <p className="text-sm text-muted-foreground">Add as many sections as you like to introduce yourself.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setData(prev => ({
                                            ...prev,
                                            longDescription: [
                                                ...(prev.longDescription || []),
                                                { id: crypto.randomUUID(), title: "", content: "" }
                                            ]
                                        }))}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Section
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {data.longDescription?.map((section, index) => (
                                        <div key={section.id} className="relative group border p-4 rounded-xl bg-slate-50">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-100"
                                                    onClick={() => setData(prev => ({ ...prev, longDescription: prev.longDescription?.filter(s => s.id !== section.id) }))}
                                                    disabled={index === 0} // Prevent deleting the first section if desired, strictly user said "add more" so maybe keep at least one
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label>Section Heading</Label>
                                                    <Input
                                                        value={section.title}
                                                        onChange={(e) => setData(prev => ({
                                                            ...prev,
                                                            longDescription: prev.longDescription?.map(s => s.id === section.id ? { ...s, title: e.target.value } : s)
                                                        }))}
                                                        placeholder="e.g. My Hobbies"
                                                        className="font-semibold"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Content</Label>
                                                    <Textarea
                                                        value={section.content}
                                                        onChange={(e) => setData(prev => ({
                                                            ...prev,
                                                            longDescription: prev.longDescription?.map(s => s.id === section.id ? { ...s, content: e.target.value } : s)
                                                        }))}
                                                        placeholder="Write something about this topic..."
                                                        className="h-32 bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
