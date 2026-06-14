import { NextRequest, NextResponse } from 'next/server';
import { isValidNhostFileId } from '@/lib/media-url';
import {
  fetchNhostStorageFileDirect,
  lookupMediaContentType,
  pickStorageTransformParams,
} from '@/lib/nhost-storage-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function storageResponseToNext(
  upstream: Response,
  overrideContentType?: string,
): Promise<NextResponse> {
  const body = await upstream.arrayBuffer();
  const headers = new Headers();
  const contentType = overrideContentType ?? upstream.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const etag = upstream.headers.get('etag');
  if (etag) headers.set('ETag', etag);
  headers.set('Cache-Control', upstream.headers.get('cache-control') ?? 'private, max-age=3600');
  return new NextResponse(body, { status: 200, headers });
}

async function resolveContentType(
  storageContentType: string | null,
  fileId: string,
): Promise<string | undefined> {
  if (storageContentType && !storageContentType.includes('octet-stream')) {
    return undefined;
  }
  const catalogType = await lookupMediaContentType(fileId);
  return catalogType ?? undefined;
}

/** Same-origin proxy for Nhost Storage thumbnails and profile/property images. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> },
): Promise<NextResponse> {
  const { fileId } = await context.params;
  const id = fileId?.trim();

  if (!id || !isValidNhostFileId(id)) {
    return NextResponse.json({ ok: false, error: 'Invalid file id' }, { status: 400 });
  }

  const transform = pickStorageTransformParams(request.nextUrl.searchParams);
  const direct = await fetchNhostStorageFileDirect(id, transform);

  if (direct.ok) {
    const overrideContentType = await resolveContentType(
      direct.response.headers.get('content-type'),
      id,
    );
    return storageResponseToNext(direct.response, overrideContentType);
  }

  return NextResponse.json(
    {
      ok: false,
      error: direct.message,
      details: { mode: 'direct', upstreamStatus: direct.status },
    },
    { status: direct.status === 401 || direct.status === 403 ? 403 : direct.status },
  );
}
