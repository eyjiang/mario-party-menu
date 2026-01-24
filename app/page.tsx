"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import NameInput from "@/components/NameInput";
import Menu from "@/components/Menu";
import OrderQueue from "@/components/OrderQueue";
import { Order } from "@/lib/types";

export default function Home() {
  const [userId, setUserId] = useState<string>("");
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    // Check for existing user ID in cookie, or create one
    const existingId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];

    if (existingId) {
      setUserId(existingId);
    } else {
      const newId = uuidv4();
      // Set httpOnly-like cookie (7-day expiry)
      document.cookie = `userId=${newId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      setUserId(newId);
    }
  }, []);

  const handleOrdersChange = useCallback(
    (orders: Order[]) => {
      const userHasOrder = orders.some((order) => order.userId === userId);
      setHasActiveOrder(userHasOrder);
    },
    [userId]
  );

  const handleOrderPlaced = useCallback(() => {
    setHasActiveOrder(true);
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
          Mario Party Drinks
        </h1>

        <NameInput />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Menu onOrderPlaced={handleOrderPlaced} hasActiveOrder={hasActiveOrder} />
          </div>
          <div>
            <OrderQueue userId={userId} onOrdersChange={handleOrdersChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
