/**
 * Image upload helpers — delegates to the client media upload proxy (catalog + dedup).
 * @see dropiti-admin-console-2/documentation/media-upload.md
 */
import {
  uploadMediaFile,
  uploadMediaFiles as uploadMediaFilesViaProxy,
  uploadProfilePhoto as uploadProfilePhotoViaProxy,
} from '@/lib/client-media-upload';
import { getMediaCanonicalUrl } from '@/lib/media-url';
import { validateImageFile } from '@/lib/image-validation';

export interface NhostUploadResult {
  publicUrl: string;
  fileId: string;
  mimeType: string;
  name: string;
  size: number;
  mediaId?: string | null;
  deduped?: boolean;
}

export { validateImageFile } from '@/lib/image-validation';

/**
 * Upload a single image via the media catalog proxy.
 * Throws on failure.
 */
export async function uploadFileToNhost(
  file: File,
  _bucketId?: string,
): Promise<NhostUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Invalid image file.');
  }

  const result = await uploadMediaFile(file);
  return {
    publicUrl: getMediaCanonicalUrl(result.publicUrl),
    fileId: result.fileId,
    mimeType: file.type || 'application/octet-stream',
    name: result.filename || file.name,
    size: file.size,
    mediaId: result.mediaId,
    deduped: result.deduped,
  };
}

/**
 * Upload multiple files via the media catalog proxy.
 * Returns canonical public URLs in the same order as the input array.
 */
export async function uploadFilesToNhost(
  files: File[],
  _bucketId?: string,
): Promise<string[]> {
  return uploadMediaFilesViaProxy(files);
}

export { uploadProfilePhotoViaProxy as uploadProfilePhoto };
