import React from 'react';

/**
 * Resilient Image URL Normalizer and Fallback Resolver
 * 
 * Handles:
 * - Direct URLs, local images (/images/*, /uploads/*)
 * - Google Drive share links (auto-converts to high-res embeddable preview)
 * - Dropbox share links (auto-converts dl=0 to raw=1)
 * - Broken or empty URLs (supplies verified fallback luxury assets)
 */

export const FALLBACK_IMAGES = [
  '/images/sky_blue_chikankari.jpg',
  '/images/yellow_mustard_suit.jpg',
  '/images/black_olive_suit.jpg',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000'
];

export const DEFAULT_FALLBACK_IMAGE = FALLBACK_IMAGES[0];

/**
 * Normalizes any image URL to ensure it loads properly in <img> tags
 */
export function normalizeImageUrl(url?: string | null, fallbackIndex: number = 0): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return FALLBACK_IMAGES[fallbackIndex % FALLBACK_IMAGES.length];
  }

  let clean = url.trim();

  // If already a base64 Data URL, return as is
  if (clean.startsWith('data:image/')) {
    return clean;
  }

  // Handle Google Drive links
  if (clean.includes('drive.google.com') || clean.includes('docs.google.com')) {
    const fileIdMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                        clean.match(/id=([a-zA-Z0-9_-]+)/) ||
                        clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Google User Content CDN directly serves high resolution image without CORS/auth blockers
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Handle Dropbox links
  if (clean.includes('dropbox.com')) {
    if (clean.includes('dl=0')) {
      return clean.replace('dl=0', 'raw=1');
    }
    if (!clean.includes('raw=1') && !clean.includes('dl=1')) {
      return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
    return clean;
  }

  // Handle protocol-relative URLs
  if (clean.startsWith('//')) {
    return `https:${clean}`;
  }

  // Handle local relative paths that may lack leading slash (e.g. "images/xyz.jpg" -> "/images/xyz.jpg")
  if (clean.startsWith('images/') || clean.startsWith('uploads/')) {
    return `/${clean}`;
  }

  // Handle Unsplash without params to ensure auto=format&fit=crop
  if (clean.includes('images.unsplash.com') && !clean.includes('auto=format')) {
    const sep = clean.includes('?') ? '&' : '?';
    return `${clean}${sep}auto=format&fit=crop&q=80&w=1200`;
  }

  return clean;
}

/**
 * Image error handler that replaces failed src with a reliable fallback
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = DEFAULT_FALLBACK_IMAGE
) {
  const target = event.currentTarget;
  if (!target) return;

  // Prevent infinite loop if fallback also fails
  if (target.src && target.src.includes(fallbackSrc)) {
    // If even the primary fallback fails, try unsplash fallback
    if (!target.src.includes('unsplash.com')) {
      target.src = FALLBACK_IMAGES[3];
    }
    return;
  }

  target.src = fallbackSrc;
}
