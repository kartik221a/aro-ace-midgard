
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Helper needed
import { Label } from "@/components/ui/label"; // Helper needed
import { Textarea } from "@/components/ui/textarea"; // Helper needed
import { useRouter } from "next/navigation";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase/client";
import { useAuth } from "@/lib/auth-context";
import { Introduction } from "@/types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Define Step Components inline or import them (Doing inline for scaffolding speed, then refactor)

const STEPS = ["About Me", "Traits", "Favorites", "Intent & Looking For", "More Info"];

export function IntroductionForm() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);

    // Form State
    const [formData, setFormData] = useState<Partial<Introduction>>({
        aboutMe: {
            name: "",
            pronouns: [],
            gender: [],
            sexuality: [],
            country: "",
            dob: "",
        },
        traits: { likes: "", dislikes: "", personality: "" },
        favorites: { colour: "", songOrArtist: "", food: "", activity: "" },
        intent: "friends",
        lookingFor: {
            friends: { ageRange: "", country: "" }, // Simplified for brevity
        },
        moreInfo: { religion: "", longDescription: "" },
    });

    const nextStep = () => setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 0));

    const handleInputChange = (section: keyof Introduction, field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section as any],
                [field]: value,
            },
        }));
    };

    // Specific handler for About Me which is strictly typed
    const handleAboutMeChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            aboutMe: { ...prev.aboutMe!, [field]: value }
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files).slice(0, 5));
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Upload Images
            const imageUrls: string[] = [];
            for (const image of images) {
                const storageRef = ref(storage, `introductions/${user.uid}/${image.name}`);
                const snapshot = await uploadBytes(storageRef, image);
                const url = await getDownloadURL(snapshot.ref);
                imageUrls.push(url);
            }

            // 2. Save Document
            const introRef = doc(db, "introductions", user.uid);
            await setDoc(introRef, {
                ...formData,
                uid: user.uid,
                status: "pending",
                images: imageUrls,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            router.push("/dashboard");
        } catch (error) {
            console.error("Error creating introduction:", error);
            alert("Failed to create introduction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium mb-2 text-slate-500">
                    {STEPS.map((step, index) => (
                        <span key={index} className={index === activeStep ? "text-rose-500 font-bold" : ""}>
                            {index + 1}. {step}
                        </span>
                    ))}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-rose-400 transition-all duration-300 ease-in-out"
                        style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{STEPS[activeStep]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                    {/* Step 1: About Me */}
                    {activeStep === 0 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label>Name / Display Name</Label>
                                <Input
                                    value={formData.aboutMe?.name || ""}
                                    onChange={(e) => handleAboutMeChange("name", e.target.value)}
                                    placeholder="What should we call you?"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Date of Birth</Label>
                                    <Input type="date"
                                        value={formData.aboutMe?.dob || ""}
                                        onChange={(e) => handleAboutMeChange("dob", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Country</Label>
                                    <Input
                                        value={formData.aboutMe?.country || ""}
                                        onChange={(e) => handleAboutMeChange("country", e.target.value)}
                                        placeholder="e.g. Canada"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Pronouns (comma separated)</Label>
                                <Input
                                    value={formData.aboutMe?.pronouns?.join(", ") || ""}
                                    onChange={(e) => handleAboutMeChange("pronouns", e.target.value.split(",").map(s => s.trim()))}
                                    placeholder="e.g. she/her, they/them"
                                />
                            </div>
                            <div>
                                <Label>Gender</Label>
                                <Input
                                    value={formData.aboutMe?.gender?.join(", ") || ""}
                                    onChange={(e) => handleAboutMeChange("gender", e.target.value.split(",").map(s => s.trim()))}
                                    placeholder="e.g. Non-binary, Female"
                                />
                            </div>
                            <div>
                                <Label>Sexuality</Label>
                                <Input
                                    value={formData.aboutMe?.sexuality?.join(", ") || ""}
                                    onChange={(e) => handleAboutMeChange("sexuality", e.target.value.split(",").map(s => s.trim()))}
                                    placeholder="e.g. Asexual, Biromantic"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Traits */}
                    {activeStep === 1 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label>Likes</Label>
                                <Textarea
                                    value={formData.traits?.likes || ""}
                                    onChange={(e) => handleInputChange("traits", "likes", e.target.value)}
                                    placeholder="What makes you happy?"
                                />
                            </div>
                            <div>
                                <Label>Dislikes</Label>
                                <Textarea
                                    value={formData.traits?.dislikes || ""}
                                    onChange={(e) => handleInputChange("traits", "dislikes", e.target.value)}
                                    placeholder="What do you avoid?"
                                />
                            </div>
                            <div>
                                <Label>Personality</Label>
                                <Textarea
                                    value={formData.traits?.personality || ""}
                                    onChange={(e) => handleInputChange("traits", "personality", e.target.value)}
                                    placeholder="Describe yourself in a few words..."
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Favorites */}
                    {activeStep === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Favourite Colour</Label>
                                <Input
                                    value={formData.favorites?.colour || ""}
                                    onChange={(e) => handleInputChange("favorites", "colour", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Favourite Food</Label>
                                <Input
                                    value={formData.favorites?.food || ""}
                                    onChange={(e) => handleInputChange("favorites", "food", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Song or Artist</Label>
                                <Input
                                    value={formData.favorites?.songOrArtist || ""}
                                    onChange={(e) => handleInputChange("favorites", "songOrArtist", e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Favourite Activity / Hobby</Label>
                                <Input
                                    value={formData.favorites?.activity || ""}
                                    onChange={(e) => handleInputChange("favorites", "activity", e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Intent */}
                    {activeStep === 3 && (
                        <div className="flex flex-col gap-4">
                            <Label>What are you looking for?</Label>
                            <div className="flex gap-4">
                                {["friends", "relationship", "both"].map(type => (
                                    <Button
                                        key={type}
                                        type="button"
                                        variant={formData.intent === type ? "default" : "outline"}
                                        onClick={() => setFormData(prev => ({ ...prev, intent: type as any }))}
                                        className="capitalize flex-1"
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                <p className="text-sm text-slate-500 mb-2">Looking For Criteria (Optional)</p>
                                {/* Simplified for scaffold - would break this down further normally */}
                                <Label>Briefly describe who you want to meet:</Label>
                                <Textarea
                                    placeholder="Age range, personality, location..."
                                // Simplified binding for scaffold proof-of-concept
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 5: More Info & Images */}
                    {activeStep === 4 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <Label>Religion / Beliefs (Optional)</Label>
                                <Input
                                    value={formData.moreInfo?.religion || ""}
                                    onChange={(e) => handleInputChange("moreInfo", "religion", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Long Description / Bio</Label>
                                <Textarea
                                    className="h-32"
                                    value={formData.moreInfo?.longDescription || ""}
                                    onChange={(e) => handleInputChange("moreInfo", "longDescription", e.target.value)}
                                    placeholder="Tell us your story..."
                                />
                            </div>
                            <div>
                                <Label>Upload Images (Max 5)</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                                <p className="text-xs text-slate-500 mt-1">{images.length} images selected</p>
                            </div>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={prevStep} disabled={activeStep === 0}>
                        Back
                    </Button>

                    {activeStep === STEPS.length - 1 ? (
                        <Button onClick={handleSubmit} disabled={loading} className="bg-rose-500 hover:bg-rose-600 text-white">
                            {loading ? "Submitting..." : "Submit Introduction"}
                        </Button>
                    ) : (
                        <Button onClick={nextStep}>
                            Next
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
