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
    let apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

    // If we are in production (not localhost) but VITE_API_URL is still localhost, try to deduce it
    if (typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        apiBase.includes('localhost')) {
        console.warn('VITE_API_URL is pointing to localhost but app is running remotely. Using current origin as fallback.');
        apiBase = window.location.origin;
    }

    // Ensure url starts with / if it doesn't
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${apiBase}${normalizedUrl}`;
};
