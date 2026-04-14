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
        <div className="text-4xl animate-float opacity-60">~</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Tropical leaf decorations */}
      <div className="fixed top-0 left-0 text-6xl opacity-10 animate-sway pointer-events-none select-none" style={{ color: '#2d5a27' }}>
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor" opacity="0.3">
          <path d="M10 90 Q 30 60 50 50 Q 30 40 10 10 Q 35 30 50 50 Q 65 30 90 10 Q 70 40 50 50 Q 70 60 90 90 Q 65 70 50 50 Q 35 70 10 90Z"/>
        </svg>
      </div>
      <div className="fixed top-10 right-0 text-5xl opacity-10 animate-sway pointer-events-none select-none" style={{ animationDelay: "1.5s", color: '#1a4a20' }}>
        <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" opacity="0.3">
          <path d="M50 5 Q 70 30 80 50 Q 70 70 50 95 Q 30 70 20 50 Q 30 30 50 5Z"/>
        </svg>
      </div>
      <div className="fixed bottom-0 right-10 text-5xl opacity-10 animate-sway pointer-events-none select-none" style={{ animationDelay: "2.5s", color: '#2d5a27' }}>
        <svg width="110" height="110" viewBox="0 0 100 100" fill="currentColor" opacity="0.3">
          <path d="M10 90 Q 30 60 50 50 Q 30 40 10 10 Q 35 30 50 50 Q 65 30 90 10 Q 70 40 50 50 Q 70 60 90 90 Q 65 70 50 50 Q 35 70 10 90Z"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm tracking-[0.3em] uppercase text-amber-600/80 font-[family-name:var(--font-cormorant)] font-light mb-2">
            Authentic Island Cuisine
          </p>
          <h1 className="text-6xl md:text-8xl font-bold mb-3 font-[family-name:var(--font-playfair)]">
            <span className="gold-text">Aloha Kitchen</span>
          </h1>
          <div className="tropical-divider w-48 mx-auto mb-4" />
          <p className="text-lg text-amber-700/60 font-[family-name:var(--font-cormorant)] font-light italic tracking-wide">
            Fresh from the islands, made with aloha
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
        <div className="text-center mt-16 mb-8">
          <div className="tropical-divider w-32 mx-auto mb-4" />
          <p className="font-[family-name:var(--font-cormorant)] text-amber-700/40 text-sm tracking-widest uppercase">
            Mahalo for dining with us
          </p>
        </div>
      </div>
    </div>
  );
}
