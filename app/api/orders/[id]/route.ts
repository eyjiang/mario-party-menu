import { NextRequest, NextResponse } from "next/server";
import { redis, ORDERS_QUEUE, orderKey, userOrderKey } from "@/lib/redis";
import { getDrinkById } from "@/lib/drinks";
import { OrderItem } from "@/lib/types";

// GET /api/orders/[id] - Fetch a single order (used to prefill the edit form)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const raw = await redis.hgetall(orderKey(id));
    if (!raw || Object.keys(raw).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    let items: OrderItem[] = [];
    if (Array.isArray(raw.items)) {
      items = raw.items as OrderItem[];
    } else if (typeof raw.items === "string" && raw.items.length > 0) {
      try {
        items = JSON.parse(raw.items);
      } catch {
        items = [];
      }
    }
    return NextResponse.json({
      order: {
        id: raw.id as string,
        userName: raw.userName as string,
        userId: raw.userId as string,
        items,
        timestamp: Number(raw.timestamp),
        status: (raw.status as "pending" | "complete") || "pending",
        completedAt: raw.completedAt ? Number(raw.completedAt) : undefined,
      },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update own pending order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User not identified" }, { status: 401 });
    }

    const raw = await redis.hgetall(orderKey(id));
    if (!raw || Object.keys(raw).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (raw.userId !== userId) {
      return NextResponse.json(
        { error: "You can only edit your own order" },
        { status: 403 }
      );
    }
    if (raw.status === "complete") {
      return NextResponse.json(
        { error: "This order is already complete" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { userName, items: rawItems } = body as {
      userName?: string;
      items?: Array<{
        drinkId: string;
        selectedOptions?: string[];
        optionNotes?: Record<string, string>;
      }>;
    };

    const cleanName = (userName || "").trim();
    if (!cleanName) {
      return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
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
      return NextResponse.json({ error: "Only one drink per order" }, { status: 400 });
    }
    if (foodCount > 2) {
      return NextResponse.json(
        { error: "Up to two food items per order" },
        { status: 400 }
      );
    }

    await redis.hset(orderKey(id), {
      userName: cleanName.slice(0, 60),
      items: JSON.stringify(items),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE /api/orders/[id] - Cancel own order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const userId = request.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json(
        { error: "User not identified" },
        { status: 401 }
      );
    }

    const order = await redis.hgetall(orderKey(orderId));
    if (!order || Object.keys(order).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    await redis.del(orderKey(orderId));
    await redis.zrem(ORDERS_QUEUE, orderId);
    await redis.del(userOrderKey(userId));
    await redis.del(`orders:${orderId}:comments`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error canceling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
