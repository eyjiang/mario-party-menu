import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, MESSAGES_LIST, messageKey } from "@/lib/redis";
import { SecretMessage } from "@/lib/types";

// GET /api/messages - Get messages for current user
export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ messages: [] });
    }

    const userName = request.cookies.get("userName")?.value;
    if (!userName) {
      return NextResponse.json({ messages: [] });
    }

    const decodedName = decodeURIComponent(userName);

    // Get all message IDs
    const messageIds = await redis.lrange(MESSAGES_LIST, 0, 100);

    if (!messageIds || messageIds.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    // Fetch messages for this user
    const messages: SecretMessage[] = [];
    for (const id of messageIds) {
      const msg = await redis.hgetall(messageKey(id as string));
      if (msg && msg.toUserName === decodedName) {
        messages.push({
          id: msg.id as string,
          fromUserId: msg.fromUserId as string,
          fromUserName: msg.fromUserName as string,
          toUserName: msg.toUserName as string,
          message: msg.message as string,
          timestamp: Number(msg.timestamp),
        });
      }
    }

    // Sort by timestamp desc
    messages.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST /api/messages - Send a secret message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toUserName, message } = body;

    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const fromUserName = request.cookies.get("userName")?.value;
    if (!fromUserName) {
      return NextResponse.json({ error: "Please set your name first" }, { status: 400 });
    }

    if (!toUserName || !message) {
      return NextResponse.json({ error: "Missing recipient or message" }, { status: 400 });
    }

    const msgId = uuidv4();
    const timestamp = Date.now();

    const secretMessage: SecretMessage = {
      id: msgId,
      fromUserId: userId,
      fromUserName: decodeURIComponent(fromUserName),
      toUserName,
      message: message.slice(0, 500),
      timestamp,
    };

    await redis.hset(messageKey(msgId), secretMessage as Record<string, string | number>);
    await redis.lpush(MESSAGES_LIST, msgId);

    // Keep only last 500 messages
    await redis.ltrim(MESSAGES_LIST, 0, 499);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
