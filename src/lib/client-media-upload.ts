import {
  CLIENT_MEDIA_UPLOAD_PATH,
  getMediaCanonicalUrl,
} from '@/lib/media-url';
import { validateImageFile } from '@/lib/image-validation';

export type ClientMediaUploadResult = {
  filename: string;
  publicUrl: string;
  s3Key: string;
  fileId: string;
  storageFileId?: string | null;
  mediaId?: string | null;
  sha256?: string;
  deduped?: boolean;
  repaired?: boolean;
  migrated?: boolean;
  storageBackend?: string;
};

type UploadEnvelope = {
  ok: boolean;
  data?: ClientMediaUploadResult;
  error?: string;
  details?: unknown;
};

export async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function uploadMediaFile(file: File): Promise<ClientMediaUploadResult> {
  const sha256 = await sha256Hex(file);
  const form = new FormData();
  form.append('file', file);
  form.append('sha256', sha256);

  const res = await fetch(CLIENT_MEDIA_UPLOAD_PATH, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  let body: UploadEnvelope;
  try {
    body = (await res.json()) as UploadEnvelope;
  } catch {
    throw new Error(`Upload failed (HTTP ${res.status})`);
  }

  if (!res.ok || !body.ok || !body.data) {
    const message =
      body.error ||
      (typeof body.details === 'object' &&
      body.details &&
      'hint' in body.details &&
      typeof (body.details as { hint?: string }).hint === 'string'
        ? (body.details as { hint: string }).hint
        : null) ||
      `Upload failed (HTTP ${res.status})`;
    throw new Error(message);
  }

  return body.data;
}

/** Upload multiple files; returns canonical public URLs for Hasura. */
export async function uploadMediaFiles(
  files: File[],
  opts: { maxMb?: number } = {},
): Promise<string[]> {
  for (const file of files) {
    const validation = validateImageFile(file, { maxMb: opts.maxMb ?? 10 });
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Invalid image file.');
    }
  }

  const results = await Promise.all(files.map((file) => uploadMediaFile(file)));
  return results.map((r) => getMediaCanonicalUrl(r.publicUrl));
}

/** Upload a profile photo; returns canonical URL for photo_url. */
export async function uploadProfilePhoto(
  file: File,
  opts: { maxMb?: number } = {},
): Promise<string> {
  const validation = validateImageFile(file, { maxMb: opts.maxMb ?? 5 });
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Invalid image file.');
  }
  const result = await uploadMediaFile(file);
  return getMediaCanonicalUrl(result.publicUrl);
}

export function formatUploadResultMessage(
  item: Pick<ClientMediaUploadResult, 'filename' | 'deduped' | 'repaired' | 'migrated'>,
): string {
  const name = item.filename || 'file';
  if (item.migrated) return `${name}: migrated to Nhost Storage`;
  if (item.repaired) return `${name}: re-uploaded (catalog updated)`;
  if (item.deduped) return `${name}: already in library`;
  return `${name}: uploaded`;
}
