import { NextRequest, NextResponse } from "next/server";
import { redis, orderKey, orderVoteKey } from "@/lib/redis";

// POST /api/vote/[id] - Vote on an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { vote } = body; // "up" or "down"

    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    // Check if order exists
    const order = await redis.hgetall(orderKey(orderId));
    if (!order || Object.keys(order).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user already voted
    const voteKey = orderVoteKey(orderId, userId);
    const existingVote = await redis.get(voteKey);

    // Get current vote counts
    let upvotes = Number(order.upvotes) || 0;
    let downvotes = Number(order.downvotes) || 0;

    // Remove old vote if exists
    if (existingVote === "up") upvotes--;
    if (existingVote === "down") downvotes--;

    // Add new vote (or toggle off if same)
    if (existingVote !== vote) {
      if (vote === "up") upvotes++;
      if (vote === "down") downvotes++;
      await redis.set(voteKey, vote);
    } else {
      // Toggle off
      await redis.del(voteKey);
    }

    // Update order
    await redis.hset(orderKey(orderId), { upvotes: String(upvotes), downvotes: String(downvotes) });

    return NextResponse.json({ upvotes, downvotes });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
