import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { redis, ORDERS_QUEUE, orderKey, userOrderKey } from "@/lib/redis";
import { getDrinkById } from "@/lib/drinks";
import { Order } from "@/lib/types";

// GET /api/orders - List all pending orders
export async function GET() {
  try {
    // Get all order IDs from the sorted set
    const orderIds = await redis.zrange(ORDERS_QUEUE, 0, -1);

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch all order details
    const orders: Order[] = [];
    for (const id of orderIds) {
      const order = await redis.hgetall(orderKey(id as string));
      if (order && Object.keys(order).length > 0) {
        let selectedOptions: string[] = [];
        try {
          selectedOptions = JSON.parse((order.selectedOptions as string) || "[]");
        } catch {
          selectedOptions = [];
        }

        orders.push({
          id: order.id as string,
          drinkId: order.drinkId as string,
          drinkName: order.drinkName as string,
          userName: order.userName as string,
          userId: order.userId as string,
          isNonAlcoholic: order.isNonAlcoholic === "true",
          selectedOptions,
          comment: (order.comment as string) || "",
          timestamp: Number(order.timestamp),
          upvotes: Number(order.upvotes) || 0,
          downvotes: Number(order.downvotes) || 0,
        });
      }
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
    const { drinkId, isNonAlcoholic, userName, comment, selectedOptions } = body;

    // Get user ID from cookie
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User not identified" },
        { status: 401 }
      );
    }

    // Validate drink
    const drink = getDrinkById(drinkId);
    if (!drink) {
      return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    }

    // Check if user already has a pending order
    const existingOrderId = await redis.get(userOrderKey(userId));
    if (existingOrderId) {
      return NextResponse.json(
        { error: "You already have a pending order" },
        { status: 409 }
      );
    }

    // Create the order
    const orderId = uuidv4();
    const timestamp = Date.now();
    const order: Order = {
      id: orderId,
      drinkId: drink.id,
      drinkName: drink.name,
      userName: userName || "Anonymous",
      userId,
      isNonAlcoholic: isNonAlcoholic || false,
      selectedOptions: selectedOptions || [],
      comment: (comment || "").slice(0, 800),
      timestamp,
      upvotes: 0,
      downvotes: 0,
    };

    // Store order in Redis
    await redis.hset(orderKey(orderId), {
      ...order,
      isNonAlcoholic: String(order.isNonAlcoholic),
      selectedOptions: JSON.stringify(order.selectedOptions),
      timestamp: String(timestamp),
      upvotes: "0",
      downvotes: "0",
    });
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
