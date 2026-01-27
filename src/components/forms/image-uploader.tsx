"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    showMainLabel?: boolean;
}

function SortableImage({ url, index, onRemove, showMainLabel }: { url: string; index: number; onRemove: () => void; showMainLabel: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: url });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group touch-none bg-white/5"
        >
            <img src={url} alt={`Upload ${index}`} className="object-cover w-full h-full" />
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start when clicking remove
                    onRemove();
                }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 z-10"
                onPointerDown={(e) => e.stopPropagation()} // Stop drag interaction specifically on the button
            >
                <X className="h-4 w-4" />
            </button>
            {index === 0 && showMainLabel && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                    Main Profile
                </div>
            )}
        </div>
    );
}

export function ImageUploader({ images, onChange, maxImages = 5, showMainLabel = true }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            console.error("Cloudinary config missing");
            alert("Cloudinary configuration missing in .env");
            return;
        }

        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            try {
                const files = Array.from(e.target.files);
                const uploadPromises = files.map(async (file) => {
                    console.log(`[Upload] Starting: ${file.name}`);

                    // Compress image
                    let fileToUpload: Blob = file;
                    try {
                        fileToUpload = await compressImage(file);
                        console.log(`[Upload] Compressed: ${file.name}`);
                    } catch (err) {
                        console.warn(`[Upload] Compression failed for ${file.name}, using original.`, err);
                    }

                    // Prepare FormData for Cloudinary
                    const formData = new FormData();
                    formData.append("file", fileToUpload);
                    formData.append("upload_preset", uploadPreset);
                    // Optional: Add folder if you want to organize them
                    // formData.append("folder", "aro-ace-midgard");

                    console.log(`[Upload] Sending to Cloudinary...`);
                    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error?.message || "Upload failed");
                    }

                    const data = await response.json();
                    console.log(`[Upload] Success: ${data.secure_url}`);
                    return data.secure_url; // Cloudinary returns 'secure_url'
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                onChange([...images, ...uploadedUrls].slice(0, maxImages));
                console.log("[Upload] All files processing complete.");
            } catch (error: any) {
                console.error("[Upload] Critical Failure:", error);
                alert(`Failed to upload images: ${error.message || "Unknown error"}`);
            } finally {
                setUploading(false);
                // Reset input
                e.target.value = "";
            }
        }
    };

    // Helper: Robust client-side compression
    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => reject(new Error("File read failed"));

            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    if (!ctx) return reject(new Error("Canvas context failed"));

                    const MAX_WIDTH = 1200;
                    // Fix: Ensure we don't upscale or divide by zero
                    const ratio = (img.width > MAX_WIDTH) ? (MAX_WIDTH / img.width) : 1;

                    canvas.width = img.width * ratio;
                    canvas.height = img.height * ratio;

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(
                        blob => blob ? resolve(blob) : reject(new Error("toBlob failed")),
                        "image/jpeg",
                        0.7
                    );
                };

                img.onerror = () => reject(new Error("Image load failed"));
                img.src = reader.result as string;
            };

            reader.readAsDataURL(file);
        });
    };

    const removeImage = async (index: number) => {
        const urlToRemove = images[index];
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);

        // Attempt Cloudinary deletion in background
        try {
            console.log(`[Cloudinary] Requesting deletion for: ${urlToRemove}`);
            const response = await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: [urlToRemove] }),
            });
            if (!response.ok) {
                console.error("[Cloudinary] Deletion failed on server");
            }
        } catch (error) {
            console.error("[Cloudinary] Network error during deletion:", error);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = images.indexOf(active.id as string);
            const newIndex = images.indexOf(over.id as string);

            if (oldIndex !== -1 && newIndex !== -1) {
                onChange(arrayMove(images, oldIndex, newIndex));
            }
        }
    };

    return (
        <div className="space-y-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <SortableContext
                        items={images}
                        strategy={rectSortingStrategy}
                    >
                        {images.map((img, idx) => (
                            <SortableImage
                                key={img}
                                url={img}
                                index={idx}
                                onRemove={() => removeImage(idx)}
                                showMainLabel={showMainLabel}
                            />
                        ))}
                    </SortableContext>

                    {images.length < maxImages && (
                        <div className="relative aspect-square rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-400 hover:bg-white/5 hover:border-white/40 transition-all group">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            ) : (
                                <>
                                    <ImageIcon className="h-8 w-8 mb-2" />
                                    <span className="text-xs">Upload Photo</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                disabled={uploading}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                onChange={handleFileChange}
                            />
                        </div>
                    )}
                </div>
            </DndContext>

            {showMainLabel && maxImages > 1 && (
                <p className="text-xs text-slate-500">
                    Drag images to reorder. First image is your main profile photo.
                </p>
            )}
        </div>
    );
}
