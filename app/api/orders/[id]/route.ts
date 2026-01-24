import { NextRequest, NextResponse } from "next/server";
import { redis, ORDERS_QUEUE, orderKey, userOrderKey } from "@/lib/redis";

// DELETE /api/orders/[id] - Cancel own order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Get user ID from cookie
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User not identified" },
        { status: 401 }
      );
    }

    // Fetch the order
    const order = await redis.hgetall(orderKey(orderId));
    if (!order || Object.keys(order).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Delete order
    await redis.del(orderKey(orderId));
    await redis.zrem(ORDERS_QUEUE, orderId);
    await redis.del(userOrderKey(userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
