"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import NameInput from "@/components/NameInput";
import Menu from "@/components/Menu";
import OrderQueue from "@/components/OrderQueue";
import SecretMessages from "@/components/SecretMessages";
import PhotoUpload from "@/components/PhotoUpload";
import GlobalChat from "@/components/GlobalChat";
import BettingSection from "@/components/BettingSection";
import { Order } from "@/lib/types";

export default function Home() {
  const [userId, setUserId] = useState<string>("");
  const [hasActiveOrder, setHasActiveOrder] = useState(false);

  useEffect(() => {
    const existingId = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];

    if (existingId) {
      setUserId(existingId);
    } else {
      const newId = uuidv4();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-spin">🍄</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Floating decorations */}
      <div className="fixed top-10 left-10 text-6xl opacity-20 animate-float pointer-events-none">🍄</div>
      <div className="fixed top-20 right-20 text-5xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "1s" }}>⭐</div>
      <div className="fixed bottom-20 left-20 text-5xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "2s" }}>🎮</div>
      <div className="fixed bottom-10 right-10 text-6xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: "0.5s" }}>🎲</div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 font-[family-name:var(--font-press-start)] leading-tight">
            <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">MARIO</span>{" "}
            <span className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">PARTY</span>
            <br />
            <span className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.7)] animate-pulse">DRINKS</span>
          </h1>
          <p className="text-xl text-gray-400 font-[family-name:var(--font-bangers)] tracking-wider">
            🎉 Order your drink and watch it appear in the queue! 🎉
          </p>
        </div>

        <NameInput />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            <Menu onOrderPlaced={handleOrderPlaced} hasActiveOrder={hasActiveOrder} />
          </div>
          <div className="xl:col-span-1">
            <div className="sticky top-4">
              <OrderQueue userId={userId} onOrdersChange={handleOrdersChange} />
            </div>
          </div>
        </div>

        {/* Betting Section */}
        <div className="mt-12">
          <BettingSection userId={userId} />
        </div>

        {/* Social Features */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SecretMessages />
          <PhotoUpload />
        </div>

        {/* Global Chat */}
        <div className="mt-8">
          <GlobalChat />
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p className="font-[family-name:var(--font-press-start)] text-xs">
            🎮 PRESS START TO DRINK 🎮
          </p>
        </div>
      </div>
    </div>
  );
}
