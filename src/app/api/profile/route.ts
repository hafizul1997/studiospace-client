
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const profile = await db.collection("userProfiles").findOne({
      userId: session.user.id,
    });

    return NextResponse.json({
      profile: {
        name: profile?.name ?? session.user.name ?? "",
        phone: profile?.phone ?? "",
        bio: profile?.bio ?? "",
      },
    });
  } catch (error) {
    console.error("GET profile error:", error);

    return NextResponse.json(
      { message: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("name" in body) ||
      !("phone" in body) ||
      !("bio" in body)
    ) {
      return NextResponse.json(
        { message: "Name, phone and bio are required." },
        { status: 400 }
      );
    }

    const { name, phone, bio } = body as {
      name: unknown;
      phone: unknown;
      bio: unknown;
    };

    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      typeof bio !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid profile data." },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanBio = bio.trim();

    if (!cleanName || cleanName.length > 100) {
      return NextResponse.json(
        { message: "Name must be between 1 and 100 characters." },
        { status: 400 }
      );
    }

    if (cleanPhone.length > 30 || cleanBio.length > 500) {
      return NextResponse.json(
        { message: "Phone or bio is too long." },
        { status: 400 }
      );
    }

    await db.collection("userProfiles").updateOne(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          name: cleanName,
          phone: cleanPhone,
          bio: cleanBio,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Profile updated successfully.",
      profile: {
        name: cleanName,
        phone: cleanPhone,
        bio: cleanBio,
      },
    });
  } catch (error) {
    console.error("PATCH profile error:", error);

    return NextResponse.json(
      { message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
