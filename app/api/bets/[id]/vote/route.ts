import { NextRequest, NextResponse } from "next/server";
import { redis, betKey, betVoteKey } from "@/lib/redis";

// POST /api/bets/[id]/vote - Vote on who will win
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

    const body = await request.json();
    const { voteFor } = body; // "creator" or "taker"

    if (voteFor !== "creator" && voteFor !== "taker") {
      return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
    }

    // Get the bet
    const bet = await redis.hgetall(betKey(betId));
    if (!bet || Object.keys(bet).length === 0) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Can only vote on locked bets
    if (bet.status !== "locked") {
      return NextResponse.json({ error: "Can only vote on locked bets" }, { status: 400 });
    }

    // Check if user already voted
    const voteKey = betVoteKey(betId, userId);
    const existingVote = await redis.get(voteKey);

    let votesForCreator = Number(bet.votesForCreator) || 0;
    let votesForTaker = Number(bet.votesForTaker) || 0;

    // Remove old vote if exists
    if (existingVote === "creator") votesForCreator--;
    if (existingVote === "taker") votesForTaker--;

    // Add new vote (or toggle off if same)
    if (existingVote !== voteFor) {
      if (voteFor === "creator") votesForCreator++;
      if (voteFor === "taker") votesForTaker++;
      await redis.set(voteKey, voteFor);
    } else {
      await redis.del(voteKey);
    }

    // Update bet
    await redis.hset(betKey(betId), {
      votesForCreator: String(votesForCreator),
      votesForTaker: String(votesForTaker),
    });

    return NextResponse.json({ votesForCreator, votesForTaker });
  } catch (error) {
    console.error("Error voting:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
