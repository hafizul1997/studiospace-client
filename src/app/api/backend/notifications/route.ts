
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/api/notifications`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Notifications Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to backend.",
      },
      { status: 500 }
    );
  }
}
