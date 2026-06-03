/**
 * On-demand revalidation endpoint.
 *
 * Called by dropiti-admin-console-2 after publishing, updating, or deleting
 * a property listing so that the explore/search page and the homepage
 * carousel reflect the change within seconds rather than waiting for the
 * time-based (60s) window.
 *
 * Usage from admin console:
 *   await fetch(`${NEXT_PUBLIC_DROPITI_CLIENT_ORIGIN}/api/revalidate`, {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'x-revalidate-secret': process.env.REVALIDATION_SECRET,
 *     },
 *     body: JSON.stringify({ tag: 'properties' }),
 *   });
 *
 * Environment variable required on dropiti-v3:
 *   REVALIDATION_SECRET=<shared secret — generate with: openssl rand -hex 32>
 */
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const ALLOWED_TAGS = ['properties'] as const;
type AllowedTag = (typeof ALLOWED_TAGS)[number];

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATION_SECRET || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { tag?: string; path?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const tag = body.tag;
  const path = body.path;

  if (tag) {
    if (!ALLOWED_TAGS.includes(tag as AllowedTag)) {
      return NextResponse.json(
        { error: `Unknown tag "${tag}". Allowed: ${ALLOWED_TAGS.join(', ')}` },
        { status: 400 }
      );
    }
    revalidateTag(tag);
  }

  if (path) {
    revalidatePath(path);
  }

  if (!tag && !path) {
    // Blanket revalidation — bust everything
    revalidateTag('properties');
    revalidatePath('/');
    revalidatePath('/search');
  }

  return NextResponse.json({
    revalidated: true,
    tag: tag ?? null,
    path: path ?? null,
    revalidatedAt: new Date().toISOString(),
  });
}
