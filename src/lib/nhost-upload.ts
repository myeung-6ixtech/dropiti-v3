import { nhost } from '@/lib/nhost';

export interface NhostUploadResult {
  publicUrl: string;
  fileId: string;
  mimeType: string;
  name: string;
  size: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

export function validateImageFile(
  file: File,
  opts: { maxMb?: number } = {},
): { valid: boolean; error?: string } {
  const maxBytes = (opts.maxMb ?? 10) * 1024 * 1024;
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Use JPEG, PNG, WebP or HEIC.`,
    };
  }
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File too large (max ${opts.maxMb ?? 10} MB).`,
    };
  }
  return { valid: true };
}

/**
 * Upload a single File to Nhost Storage using the authenticated user's JWT.
 * Throws on failure.
 */
export async function uploadFileToNhost(
  file: File,
  bucketId?: string,
): Promise<NhostUploadResult> {
  const { fileMetadata, error } = await nhost.storage.upload({
    file,
    ...(bucketId ? { bucketId } : {}),
  });

  if (error || !fileMetadata) {
    throw new Error(error?.message ?? 'Upload failed');
  }

  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION!;
  const publicUrl = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`;

  return {
    publicUrl,
    fileId: fileMetadata.id,
    mimeType: fileMetadata.mimeType,
    name: fileMetadata.name,
    size: fileMetadata.size,
  };
}

/**
 * Upload multiple files to Nhost Storage in parallel.
 * Returns public URLs in the same order as the input array.
 */
export async function uploadFilesToNhost(
  files: File[],
  bucketId?: string,
): Promise<string[]> {
  const results = await Promise.all(
    files.map((file) => uploadFileToNhost(file, bucketId)),
  );
  return results.map((r) => r.publicUrl);
}
