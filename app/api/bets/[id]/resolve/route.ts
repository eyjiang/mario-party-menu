import { NextRequest, NextResponse } from "next/server";
import { redis, BETS_OPEN, BETS_RESOLVED, betKey } from "@/lib/redis";

// POST /api/bets/[id]/resolve - Resolve a bet (staff only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: betId } = await params;

    const body = await request.json();
    const { staffKey, winnerId } = body;

    // Verify staff key
    if (staffKey !== process.env.STAFF_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get the bet
    const bet = await redis.hgetall(betKey(betId));
    if (!bet || Object.keys(bet).length === 0) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Can only resolve locked bets
    if (bet.status !== "locked") {
      return NextResponse.json({ error: "Can only resolve locked bets" }, { status: 400 });
    }

    // Validate winner
    if (winnerId !== bet.creatorId && winnerId !== bet.takerId) {
      return NextResponse.json({ error: "Invalid winner" }, { status: 400 });
    }

    const winnerName = winnerId === bet.creatorId ? bet.creatorName : bet.takerName;

    // Update the bet
    await redis.hset(betKey(betId), {
      status: "resolved",
      winnerId,
      winnerName: winnerName as string,
      resolvedAt: String(Date.now()),
    });

    // Move from open to resolved
    await redis.lrem(BETS_OPEN, 0, betId);
    await redis.lpush(BETS_RESOLVED, betId);

    // Keep only last 20 resolved bets
    await redis.ltrim(BETS_RESOLVED, 0, 19);

    return NextResponse.json({ success: true, winnerName });
  } catch (error) {
    console.error("Error resolving bet:", error);
    return NextResponse.json({ error: "Failed to resolve bet" }, { status: 500 });
  }
}
