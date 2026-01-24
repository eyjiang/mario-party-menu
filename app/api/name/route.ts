import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const NAME_TO_USER = "names:to_user"; // Hash: name -> userId
const USER_TO_NAME = "names:to_name"; // Hash: userId -> name

// GET /api/name - Get current user's name
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ name: null });
    }

    const name = await redis.hget(USER_TO_NAME, userId);
    return NextResponse.json({ name: name || null });
  } catch (error) {
    console.error("Error getting name:", error);
    return NextResponse.json({ error: "Failed to get name" }, { status: 500 });
  }
}

// POST /api/name - Register or update name
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 30);

    // Check if this name is already taken by someone else
    const existingOwner = await redis.hget(NAME_TO_USER, cleanName.toLowerCase());
    if (existingOwner && existingOwner !== userId) {
      return NextResponse.json({ error: "This name is already taken" }, { status: 409 });
    }

    // Get user's old name to clean up
    const oldName = await redis.hget(USER_TO_NAME, userId);
    if (oldName && oldName !== cleanName) {
      // Remove old name mapping
      await redis.hdel(NAME_TO_USER, (oldName as string).toLowerCase());
    }

    // Register the new name
    await redis.hset(NAME_TO_USER, { [cleanName.toLowerCase()]: userId });
    await redis.hset(USER_TO_NAME, { [userId]: cleanName });

    // Set cookie
    const response = NextResponse.json({ success: true, name: cleanName });
    response.cookies.set("userName", encodeURIComponent(cleanName), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    console.error("Error setting name:", error);
    return NextResponse.json({ error: "Failed to set name" }, { status: 500 });
  }
}
