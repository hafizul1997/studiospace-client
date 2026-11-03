
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(`${API_URL}/api/notifications`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => []);

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Notifications Proxy Error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch notifications." },
      { status: 500 }
    );
  }
}
