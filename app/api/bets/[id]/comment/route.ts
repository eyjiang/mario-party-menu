import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, betKey, betCommentsKey } from "@/lib/redis";
import { BetComment } from "@/lib/types";

// GET /api/bets/[id]/comment - Get comments for a bet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: betId } = await params;

    const commentIds = await redis.lrange(betCommentsKey(betId), 0, 50);

    if (!commentIds || commentIds.length === 0) {
      return NextResponse.json({ comments: [] });
    }

    const comments: BetComment[] = [];
    for (const id of commentIds) {
      const comment = await redis.hgetall(`betcomment:${id}`);
      if (comment && Object.keys(comment).length > 0) {
        comments.push({
          id: comment.id as string,
          betId: comment.betId as string,
          userId: comment.userId as string,
          userName: comment.userName as string,
          message: comment.message as string,
          timestamp: Number(comment.timestamp),
        });
      }
    }

    // Sort by timestamp ascending
    comments.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/bets/[id]/comment - Add a comment to a bet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: betId } = await params;

    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const userName = request.cookies.get("userName")?.value;
    if (!userName) {
      return NextResponse.json({ error: "Please set your name first" }, { status: 400 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check bet exists
    const bet = await redis.hgetall(betKey(betId));
    if (!bet || Object.keys(bet).length === 0) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    const commentId = uuidv4();
    const timestamp = Date.now();

    await redis.hset(`betcomment:${commentId}`, {
      id: commentId,
      betId,
      userId,
      userName: decodeURIComponent(userName),
      message: message.trim().slice(0, 300),
      timestamp: String(timestamp),
    });

    await redis.rpush(betCommentsKey(betId), commentId);

    // Keep only last 50 comments per bet
    await redis.ltrim(betCommentsKey(betId), -50, -1);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
