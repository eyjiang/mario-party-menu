import { NextRequest, NextResponse } from "next/server";
import { redis, ORDERS_QUEUE, orderKey, userOrderKey } from "@/lib/redis";

// POST /api/complete/[id] - Mark order as complete (staff only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { staffKey } = body;

    // Verify staff key
    if (staffKey !== process.env.STAFF_KEY) {
      return NextResponse.json({ error: "Invalid staff key" }, { status: 403 });
    }

    // Fetch the order
    const order = await redis.hgetall(orderKey(orderId));
    if (!order || Object.keys(order).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete order
    await redis.del(orderKey(orderId));
    await redis.zrem(ORDERS_QUEUE, orderId);
    await redis.del(userOrderKey(order.userId as string));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json(
      { error: "Failed to complete order" },
      { status: 500 }
    );
  }
}
