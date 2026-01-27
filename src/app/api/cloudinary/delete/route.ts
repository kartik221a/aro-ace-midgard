import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getPublicIdFromUrl } from "@/lib/cloudinary-utils";

// Configure Cloudinary with server-side environment variables
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const { urls } = await request.json();

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({ error: "Missing or invalid URLs" }, { status: 400 });
        }

        const publicIds = urls
            .map(url => getPublicIdFromUrl(url))
            .filter((id): id is string => id !== null);

        if (publicIds.length === 0) {
            return NextResponse.json({ error: "Could not extract public IDs from provided URLs" }, { status: 400 });
        }

        console.log(`[Cloudinary Delete] Deleting public IDs:`, publicIds);

        // Delete multiple images
        const results = await Promise.all(
            publicIds.map(id => cloudinary.uploader.destroy(id))
        );

        console.log(`[Cloudinary Delete] Results:`, results);

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error("[Cloudinary Delete] Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
