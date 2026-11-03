import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function forwardRequest(
  request: NextRequest,
  context: RouteContext,
  method: "PATCH" | "DELETE"
) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();

    const headers: Record<string, string> = {
      Cookie: cookieStore.toString(),
    };

    const options: RequestInit = {
      method,
      headers,
      cache: "no-store",
    };

    if (method === "PATCH") {
      headers["Content-Type"] = "application/json";
      options.body = await request.text();
    }

    const response = await fetch(
      `${API_URL}/api/studios/${encodeURIComponent(id)}`,
      options
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error(`${method} Studio Proxy Error:`, error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to backend.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  return forwardRequest(request, context, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  return forwardRequest(request, context, "DELETE");
}