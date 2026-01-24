import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis } from "@/lib/redis";

const CHAT_LIST = "chat:messages";

interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: number;
}

// GET /api/chat - Get all chat messages
export async function GET() {
  try {
    const messageIds = await redis.lrange(CHAT_LIST, 0, 100);

    if (!messageIds || messageIds.length === 0) {
      return NextResponse.json({ messages: [] });
    }

    const messages: ChatMessage[] = [];
    for (const id of messageIds) {
      const msg = await redis.hgetall(`chat:${id}`);
      if (msg && Object.keys(msg).length > 0) {
        messages.push({
          id: msg.id as string,
          userName: msg.userName as string,
          message: msg.message as string,
          timestamp: Number(msg.timestamp),
        });
      }
    }

    // Sort by timestamp ascending (oldest first for chat)
    messages.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

// POST /api/chat - Send a chat message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const userName = request.cookies.get("userName")?.value;
    if (!userName) {
      return NextResponse.json({ error: "Please set your name first" }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const msgId = uuidv4();
    const timestamp = Date.now();

    await redis.hset(`chat:${msgId}`, {
      id: msgId,
      userName: decodeURIComponent(userName),
      message: message.trim().slice(0, 300),
      timestamp: String(timestamp),
    });
    await redis.rpush(CHAT_LIST, msgId);

    // Keep only last 100 messages
    await redis.ltrim(CHAT_LIST, -100, -1);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error sending chat:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
