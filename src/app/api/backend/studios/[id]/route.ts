
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper: Get authenticated cookies
async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

// GET: Get single studio
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      `${API_URL}/api/studios/${encodeURIComponent(id)}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Get Studio Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to backend.",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update studio
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = await getCookieHeader();

    if (!cookieHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(
      `${API_URL}/api/studios/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          Cookie: cookieHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Update Studio Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to backend.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete studio
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = await getCookieHeader();

    if (!cookieHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_URL}/api/studios/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Delete Studio Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to backend.",
      },
      { status: 500 }
    );
  }
}
