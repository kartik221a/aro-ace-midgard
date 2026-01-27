/**
 * Extracts the public ID from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/dmebixlf6/image/upload/v1738000000/aroace_uploads/abc123.jpg
 * Result: aroace_uploads/abc123
 */
export function getPublicIdFromUrl(url: string): string | null {
    try {
        const parts = url.split("/");
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) return null;

        // Skip 'upload' and the optional 'v12345678' version segment
        let startIndex = uploadIndex + 1;
        if (parts[startIndex].startsWith("v") && /^\d+$/.test(parts[startIndex].substring(1))) {
            startIndex++;
        }

        // Join the remaining parts and remove the extension
        const remaining = parts.slice(startIndex).join("/");
        const lastDotIndex = remaining.lastIndexOf(".");
        if (lastDotIndex === -1) return remaining;

        return remaining.substring(0, lastDotIndex);
    } catch (error) {
        console.error("Error extracting public ID from Cloudinary URL:", error);
        return null;
    }
}
