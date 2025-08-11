// ========================================
// ASSET & ICON TYPES
// ========================================

import React from 'react';

// ========================================
// ICON BASE TYPES
// ========================================

export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
  children?: React.ReactNode;
  size?: string | number;
  color?: string;
  title?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
  role?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export interface IconProps extends IconBaseProps {
  variant?: 'outline' | 'solid' | 'duotone' | 'mini';
  weight?: 'thin' | 'light' | 'regular' | 'medium' | 'bold' | 'heavy';
  mirrored?: boolean;
}

// ========================================
// ICON CATEGORIES
// ========================================

export type IconCategory = 
  | 'navigation'
  | 'action'
  | 'communication'
  | 'file'
  | 'device'
  | 'social'
  | 'business'
  | 'design'
  | 'weather'
  | 'transport'
  | 'sport'
  | 'food'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'finance'
  | 'home'
  | 'nature'
  | 'technology'
  | 'travel';

export interface IconMetadata {
  name: string;
  category: IconCategory;
  tags: string[];
  keywords: string[];
  description?: string;
  author?: string;
  license?: string;
  version?: string;
}

// ========================================
// IMAGE ASSET TYPES
// ========================================

export interface ImageAsset {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  format: 'jpg' | 'jpeg' | 'png' | 'webp' | 'gif' | 'svg' | 'avif';
  size: number; // in bytes
  quality?: number;
  placeholder?: string; // base64 or blur hash
  metadata?: {
    camera?: string;
    location?: string;
    date?: string;
    tags?: string[];
  };
}

export interface ImageVariants {
  original: ImageAsset;
  thumbnail?: ImageAsset;
  small?: ImageAsset;
  medium?: ImageAsset;
  large?: ImageAsset;
  xl?: ImageAsset;
}

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  sizes: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

// ========================================
// VIDEO ASSET TYPES
// ========================================

export interface VideoAsset {
  id: string;
  url: string;
  poster?: string;
  title: string;
  description?: string;
  duration: number; // in seconds
  format: 'mp4' | 'webm' | 'ogg' | 'mov' | 'avi';
  size: number; // in bytes
  quality: 'low' | 'medium' | 'high' | 'ultra';
  subtitles?: Array<{
    language: string;
    url: string;
    format: 'vtt' | 'srt';
  }>;
  metadata?: {
    codec?: string;
    bitrate?: number;
    framerate?: number;
    resolution?: string;
  };
}

export interface VideoVariants {
  original: VideoAsset;
  low?: VideoAsset;
  medium?: VideoAsset;
  high?: VideoAsset;
  ultra?: VideoAsset;
}

// ========================================
// AUDIO ASSET TYPES
// ========================================

export interface AudioAsset {
  id: string;
  url: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number; // in seconds
  format: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac';
  size: number; // in bytes
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  metadata?: {
    genre?: string;
    year?: number;
    track?: number;
    totalTracks?: number;
    disc?: number;
    totalDiscs?: number;
  };
}

// ========================================
// DOCUMENT ASSET TYPES
// ========================================

export interface DocumentAsset {
  id: string;
  url: string;
  title: string;
  description?: string;
  format: 'pdf' | 'doc' | 'docx' | 'txt' | 'rtf' | 'odt';
  size: number; // in bytes
  pages?: number;
  language?: string;
  category?: 'contract' | 'invoice' | 'report' | 'manual' | 'other';
  metadata?: {
    author?: string;
    created?: string;
    modified?: string;
    keywords?: string[];
    subject?: string;
  };
}

// ========================================
// FONT ASSET TYPES
// ========================================

export interface FontAsset {
  id: string;
  family: string;
  style: 'normal' | 'italic';
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  format: 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot';
  url: string;
  display: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  fallback?: string[];
}

export interface FontFamily {
  name: string;
  variants: FontAsset[];
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  license?: string;
  designer?: string;
  foundry?: string;
}

// ========================================
// 3D & MODEL ASSET TYPES
// ========================================

export interface Model3DAsset {
  id: string;
  url: string;
  title: string;
  description?: string;
  format: 'gltf' | 'glb' | 'obj' | 'fbx' | 'dae' | '3ds';
  size: number; // in bytes
  vertices?: number;
  faces?: number;
  materials?: number;
  textures?: number;
  animations?: number;
  metadata?: {
    author?: string;
    software?: string;
    version?: string;
    units?: string;
    scale?: number;
  };
}

// ========================================
// ASSET COLLECTION TYPES
// ========================================

export interface AssetCollection {
  id: string;
  name: string;
  description?: string;
  assets: Array<ImageAsset | VideoAsset | AudioAsset | DocumentAsset>;
  tags: string[];
  category: string;
  created: string;
  updated: string;
  thumbnail?: ImageAsset;
}

export interface AssetLibrary {
  id: string;
  name: string;
  description?: string;
  collections: AssetCollection[];
  totalAssets: number;
  totalSize: number;
  categories: string[];
  tags: string[];
  created: string;
  updated: string;
}

// ========================================
// ASSET UPLOAD TYPES
// ========================================

export interface AssetUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  asset?: ImageAsset | VideoAsset | AudioAsset | DocumentAsset;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  uploadId: string;
  progress: number;
  status: AssetUpload['status'];
  error?: string;
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
}

// ========================================
// ASSET TRANSFORMATION TYPES
// ========================================

export interface ImageTransformation {
  resize?: {
    width?: number;
    height?: number;
    mode?: 'fit' | 'fill' | 'crop' | 'thumb';
    gravity?: 'center' | 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality?: number;
  format?: ImageAsset['format'];
  effects?: {
    blur?: number;
    sharpen?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    hue?: number;
  };
  filters?: {
    grayscale?: boolean;
    sepia?: boolean;
    invert?: boolean;
    opacity?: number;
  };
}

export interface VideoTransformation {
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
  };
  trim?: {
    start: number;
    end: number;
  };
  quality?: VideoAsset['quality'];
  format?: VideoAsset['format'];
  fps?: number;
  bitrate?: number;
}

// ========================================
// ASSET METADATA TYPES
// ========================================

export interface AssetMetadata {
  id: string;
  assetId: string;
  key: string;
  value: string | number | boolean | object;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  category?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// ASSET PERMISSION TYPES
// ========================================

export interface AssetPermission {
  id: string;
  assetId: string;
  userId: string;
  permission: 'view' | 'edit' | 'delete' | 'share' | 'download';
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
}

export interface AssetSharing {
  id: string;
  assetId: string;
  sharedBy: string;
  sharedWith: string;
  permission: AssetPermission['permission'];
  message?: string;
  sharedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

// ========================================
// ASSET ANALYTICS TYPES
// ========================================

export interface AssetUsage {
  id: string;
  assetId: string;
  userId: string;
  action: 'view' | 'download' | 'share' | 'edit' | 'delete';
  timestamp: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    sessionId?: string;
  };
}

export interface AssetStats {
  assetId: string;
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  uniqueViewers: number;
  averageViewTime?: number;
  lastViewed?: string;
  createdAt: string;
  updatedAt: string;
}
