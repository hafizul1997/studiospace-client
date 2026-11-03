
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required.",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    const response = await fetch(
      `${API_URL}/api/bookings/${encodeURIComponent(id)}/cancel`,
      {
        method: "PATCH",
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
    console.error("Cancel Booking Proxy Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to backend.",
      },
      { status: 500 }
    );
  }
}
