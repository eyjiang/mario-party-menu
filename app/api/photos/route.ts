import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, PHOTOS_LIST, photoKey } from "@/lib/redis";
import { Photo } from "@/lib/types";

// GET /api/photos - Get all photos
export async function GET() {
  try {
    const photoIds = await redis.lrange(PHOTOS_LIST, 0, 50);

    if (!photoIds || photoIds.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    const photos: Photo[] = [];
    for (const id of photoIds) {
      const photo = await redis.hgetall(photoKey(id as string));
      if (photo && Object.keys(photo).length > 0) {
        photos.push({
          id: photo.id as string,
          userId: photo.userId as string,
          userName: photo.userName as string,
          dataUrl: photo.dataUrl as string,
          timestamp: Number(photo.timestamp),
        });
      }
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}

// POST /api/photos - Upload a photo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataUrl } = body;

    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const userName = request.cookies.get("userName")?.value;
    if (!userName) {
      return NextResponse.json({ error: "Please set your name first" }, { status: 400 });
    }

    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    // Limit image size (roughly 500KB base64)
    if (dataUrl.length > 700000) {
      return NextResponse.json({ error: "Image too large (max 500KB)" }, { status: 400 });
    }

    const photoId = uuidv4();
    const timestamp = Date.now();

    const photo: Photo = {
      id: photoId,
      userId,
      userName: decodeURIComponent(userName),
      dataUrl,
      timestamp,
    };

    await redis.hset(photoKey(photoId), photo as Record<string, string | number>);
    await redis.lpush(PHOTOS_LIST, photoId);

    // Keep only last 50 photos
    await redis.ltrim(PHOTOS_LIST, 0, 49);

    return NextResponse.json({ photo: { id: photoId, userName: photo.userName, timestamp } }, { status: 201 });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
