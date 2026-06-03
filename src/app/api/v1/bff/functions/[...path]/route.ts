import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isPublicClientBffRoute } from "@/lib/nhost-functions";

const ACCESS_TOKEN_COOKIE = "nhost_access_token";

function getFunctionsBaseUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_FUNCTIONS_URL?.replace(/\/$/, "");
  return url && url.length > 0 ? url : null;
}

async function proxyToFunctions(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const base = getFunctionsBaseUrl();
  if (!base) {
    return NextResponse.json(
      { ok: false, error: "NEXT_PUBLIC_FUNCTIONS_URL is not configured" },
      { status: 503 }
    );
  }

  const subPath = pathSegments.join("/");
  const isPublicRoute = isPublicClientBffRoute(request.method, subPath);

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  // Browser may send Bearer from Nhost client before httpOnly cookie is synced
  if (!accessToken) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.slice(7).trim();
    }
  }

  if (!accessToken && !isPublicRoute) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(`${base}/v1/${subPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const headers: HeadersInit = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      body = text;
      headers["Content-Type"] =
        request.headers.get("content-type") ?? "application/json";
    }
  }

  const upstream = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteCtx) {
  const { path } = await context.params;
  return proxyToFunctions(request, path);
}

export async function POST(request: NextRequest, context: RouteCtx) {
  const { path } = await context.params;
  return proxyToFunctions(request, path);
}

export async function PUT(request: NextRequest, context: RouteCtx) {
  const { path } = await context.params;
  return proxyToFunctions(request, path);
}

export async function PATCH(request: NextRequest, context: RouteCtx) {
  const { path } = await context.params;
  return proxyToFunctions(request, path);
}

export async function DELETE(request: NextRequest, context: RouteCtx) {
  const { path } = await context.params;
  return proxyToFunctions(request, path);
}
