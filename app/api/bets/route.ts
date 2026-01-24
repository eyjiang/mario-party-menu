import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, BETS_OPEN, BETS_RESOLVED, betKey } from "@/lib/redis";
import { Bet } from "@/lib/types";

// GET /api/bets - List all bets
export async function GET() {
  try {
    // Get open bets
    const openIds = await redis.lrange(BETS_OPEN, 0, -1);
    const resolvedIds = await redis.lrange(BETS_RESOLVED, 0, 20);

    const openBets: Bet[] = [];
    const resolvedBets: Bet[] = [];

    for (const id of openIds || []) {
      const bet = await redis.hgetall(betKey(id as string));
      if (bet && Object.keys(bet).length > 0) {
        openBets.push({
          id: bet.id as string,
          creatorId: bet.creatorId as string,
          creatorName: bet.creatorName as string,
          creatorVenmo: bet.creatorVenmo as string || undefined,
          description: bet.description as string,
          amount: Number(bet.amount),
          amountType: bet.amountType as "dollars" | "shots",
          status: bet.status as "open" | "locked" | "resolved",
          takerId: bet.takerId as string || undefined,
          takerName: bet.takerName as string || undefined,
          takerVenmo: bet.takerVenmo as string || undefined,
          winnerId: bet.winnerId as string || undefined,
          winnerName: bet.winnerName as string || undefined,
          votesForCreator: Number(bet.votesForCreator) || 0,
          votesForTaker: Number(bet.votesForTaker) || 0,
          timestamp: Number(bet.timestamp),
          resolvedAt: bet.resolvedAt ? Number(bet.resolvedAt) : undefined,
        });
      }
    }

    for (const id of resolvedIds || []) {
      const bet = await redis.hgetall(betKey(id as string));
      if (bet && Object.keys(bet).length > 0) {
        resolvedBets.push({
          id: bet.id as string,
          creatorId: bet.creatorId as string,
          creatorName: bet.creatorName as string,
          creatorVenmo: bet.creatorVenmo as string || undefined,
          description: bet.description as string,
          amount: Number(bet.amount),
          amountType: bet.amountType as "dollars" | "shots",
          status: bet.status as "open" | "locked" | "resolved",
          takerId: bet.takerId as string || undefined,
          takerName: bet.takerName as string || undefined,
          takerVenmo: bet.takerVenmo as string || undefined,
          winnerId: bet.winnerId as string || undefined,
          winnerName: bet.winnerName as string || undefined,
          votesForCreator: Number(bet.votesForCreator) || 0,
          votesForTaker: Number(bet.votesForTaker) || 0,
          timestamp: Number(bet.timestamp),
          resolvedAt: bet.resolvedAt ? Number(bet.resolvedAt) : undefined,
        });
      }
    }

    // Sort open bets: locked first, then by timestamp
    openBets.sort((a, b) => {
      if (a.status === "locked" && b.status !== "locked") return -1;
      if (a.status !== "locked" && b.status === "locked") return 1;
      return b.timestamp - a.timestamp;
    });

    return NextResponse.json({ openBets, resolvedBets });
  } catch (error) {
    console.error("Error fetching bets:", error);
    return NextResponse.json({ error: "Failed to fetch bets" }, { status: 500 });
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const userName = request.cookies.get("userName")?.value;
    if (!userName) {
      return NextResponse.json({ error: "Please set your name first" }, { status: 400 });
    }

    const body = await request.json();
    const { description, amount, amountType, venmo } = body;

    if (!description || !amount || !amountType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amountType !== "dollars" && amountType !== "shots") {
      return NextResponse.json({ error: "Invalid amount type" }, { status: 400 });
    }

    const betId = uuidv4();
    const timestamp = Date.now();

    await redis.hset(betKey(betId), {
      id: betId,
      creatorId: userId,
      creatorName: decodeURIComponent(userName),
      creatorVenmo: venmo || "",
      description: description.slice(0, 500),
      amount: String(amount),
      amountType,
      status: "open",
      takerId: "",
      takerName: "",
      takerVenmo: "",
      winnerId: "",
      winnerName: "",
      votesForCreator: "0",
      votesForTaker: "0",
      timestamp: String(timestamp),
      resolvedAt: "",
    });

    await redis.lpush(BETS_OPEN, betId);

    return NextResponse.json({ success: true, betId }, { status: 201 });
  } catch (error) {
    console.error("Error creating bet:", error);
    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 });
  }
}
