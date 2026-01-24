import { NextRequest, NextResponse } from "next/server";
import { redis, betKey } from "@/lib/redis";

// POST /api/bets/[id]/take - Take a bet
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
    const { venmo } = body;

    // Get the bet
    const bet = await redis.hgetall(betKey(betId));
    if (!bet || Object.keys(bet).length === 0) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Check if bet is still open
    if (bet.status !== "open") {
      return NextResponse.json({ error: "Bet is no longer open" }, { status: 400 });
    }

    // Can't take your own bet
    if (bet.creatorId === userId) {
      return NextResponse.json({ error: "You cannot take your own bet" }, { status: 400 });
    }

    // Lock the bet
    await redis.hset(betKey(betId), {
      status: "locked",
      takerId: userId,
      takerName: decodeURIComponent(userName),
      takerVenmo: venmo || "",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error taking bet:", error);
    return NextResponse.json({ error: "Failed to take bet" }, { status: 500 });
  }
}
