import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getImageUrl = (url: string | undefined | null) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;

    // Get base URL from environment or default to localhost
    // We remove '/api' if it exists because the images are served from root/uploads pattern often used in this app
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

    // Ensure url starts with / if it doesn't
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${apiBase}${normalizedUrl}`;
};
