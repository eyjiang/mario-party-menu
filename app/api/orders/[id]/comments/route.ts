import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, orderKey } from "@/lib/redis";

type OrderComment = {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
};

const commentsKey = (orderId: string) => `orders:${orderId}:comments`;

// GET /api/orders/[id]/comments - list comments (oldest first)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = await redis.lrange(commentsKey(id), 0, -1);
    const comments: OrderComment[] = (raw || [])
      .map((entry) => {
        try {
          return typeof entry === "string" ? JSON.parse(entry) : entry;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as OrderComment[];
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/orders/[id]/comments - add a comment to any order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User not identified" },
        { status: 401 }
      );
    }

    const order = await redis.hgetall(orderKey(id));
    if (!order || Object.keys(order).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const userName = String(body.userName || "").trim().slice(0, 50);
    const text = String(body.text || "").trim().slice(0, 280);
    if (!userName) {
      return NextResponse.json(
        { error: "Please add your name" },
        { status: 400 }
      );
    }
    if (!text) {
      return NextResponse.json(
        { error: "Comment can't be empty" },
        { status: 400 }
      );
    }

    const comment: OrderComment = {
      id: uuidv4(),
      orderId: id,
      userId,
      userName,
      text,
      timestamp: Date.now(),
    };

    await redis.rpush(commentsKey(id), JSON.stringify(comment));

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
