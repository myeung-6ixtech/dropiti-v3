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
