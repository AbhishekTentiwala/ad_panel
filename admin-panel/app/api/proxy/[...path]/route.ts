import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path, "POST");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxy(request, params.path, "DELETE");
}

async function proxy(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  if (!API_BASE) {
    return NextResponse.json(
      { detail: "API base URL not configured" },
      { status: 500 }
    );
  }
  const path = pathSegments.join("/");
  const url = `${API_BASE}/${path}${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "content-type" || lower === "authorization") {
      headers[key] = value;
    }
  });
  try {
    const body = method !== "GET" ? await request.text() : undefined;
    const res = await fetch(url, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body,
    });
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "text/plain" },
      });
    }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { detail: "Failed to reach API. Check server and CORS." },
      { status: 502 }
    );
  }
}
