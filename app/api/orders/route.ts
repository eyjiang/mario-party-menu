import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, ORDERS_QUEUE, orderKey, userOrderKey } from "@/lib/redis";
import { getDrinkById } from "@/lib/drinks";
import { Order, OrderItem } from "@/lib/types";

type StoredOrder = {
  id: string;
  userName: string;
  userId: string;
  items: string;
  timestamp: string;
  status: string;
  completedAt?: string;
};

function parseOrder(raw: Record<string, unknown>): Order | null {
  if (!raw || Object.keys(raw).length === 0) return null;
  let items: OrderItem[] = [];
  try {
    items = JSON.parse((raw.items as string) || "[]");
  } catch {
    items = [];
  }
  return {
    id: raw.id as string,
    userName: raw.userName as string,
    userId: raw.userId as string,
    items,
    timestamp: Number(raw.timestamp),
    status: (raw.status as "pending" | "complete") || "pending",
    completedAt: raw.completedAt ? Number(raw.completedAt) : undefined,
  };
}

// GET /api/orders - List all orders (pending + completed)
export async function GET() {
  try {
    const orderIds = await redis.zrange(ORDERS_QUEUE, 0, -1);

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const orders: Order[] = [];
    for (const id of orderIds) {
      const raw = await redis.hgetall(orderKey(id as string));
      const parsed = parseOrder(raw as Record<string, unknown>);
      if (parsed) orders.push(parsed);
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, items: rawItems } = body as {
      userName?: string;
      items?: Array<{
        drinkId: string;
        selectedOptions?: string[];
        optionNotes?: Record<string, string>;
      }>;
    };

    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User not identified" },
        { status: 401 }
      );
    }

    const cleanName = (userName || "").trim();
    if (!cleanName) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 }
      );
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one item" },
        { status: 400 }
      );
    }

    const items: OrderItem[] = [];
    let drinkCount = 0;
    let foodCount = 0;
    for (const it of rawItems) {
      const drink = getDrinkById(it.drinkId);
      if (!drink) {
        return NextResponse.json({ error: "Invalid item" }, { status: 400 });
      }
      if (drink.category === "drinks") drinkCount++;
      else foodCount++;
      items.push({
        drinkId: drink.id,
        drinkName: drink.name,
        category: drink.category,
        selectedOptions: Array.isArray(it.selectedOptions)
          ? it.selectedOptions
          : [],
        optionNotes:
          it.optionNotes && typeof it.optionNotes === "object"
            ? it.optionNotes
            : undefined,
      });
    }

    if (drinkCount > 1) {
      return NextResponse.json(
        { error: "Only one drink per order" },
        { status: 400 }
      );
    }
    if (foodCount > 2) {
      return NextResponse.json(
        { error: "Up to two food items per order" },
        { status: 400 }
      );
    }

    const existingOrderId = await redis.get(userOrderKey(userId));
    if (existingOrderId) {
      const raw = await redis.hgetall(orderKey(existingOrderId as string));
      const existing = parseOrder(raw as Record<string, unknown>);
      if (existing && existing.status === "pending") {
        return NextResponse.json(
          { error: "You already have a pending order" },
          { status: 409 }
        );
      }
      // Stale marker (e.g., order was completed) — clear and continue.
      await redis.del(userOrderKey(userId));
    }

    const orderId = uuidv4();
    const timestamp = Date.now();
    const order: Order = {
      id: orderId,
      userName: cleanName.slice(0, 60),
      userId,
      items,
      timestamp,
      status: "pending",
    };

    const stored: StoredOrder = {
      id: order.id,
      userName: order.userName,
      userId: order.userId,
      items: JSON.stringify(order.items),
      timestamp: String(timestamp),
      status: "pending",
    };

    await redis.hset(orderKey(orderId), stored);
    await redis.zadd(ORDERS_QUEUE, { score: timestamp, member: orderId });
    await redis.set(userOrderKey(userId), orderId);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
