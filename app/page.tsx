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
        <div className="text-amber-800/30 animate-pulse font-[family-name:var(--font-cormorant)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      {/* Inline SVG tropical leaves layered behind content */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left monstera cluster */}
        <svg className="absolute -top-10 -left-16 w-[500px] h-[500px] opacity-[0.07]" viewBox="0 0 500 500" fill="none">
          <path d="M80 400 C80 400 100 300 160 240 C180 220 200 200 200 160 C200 120 180 80 220 40 C260 0 300 20 300 60 C300 100 280 120 280 160 C280 200 320 220 340 260 C360 300 360 360 320 400 C280 440 200 440 160 420 C120 400 80 400 80 400Z" fill="#1a5a22"/>
          <path d="M200 160 C200 160 240 200 200 260" stroke="#0a3a12" strokeWidth="2" fill="none"/>
          <path d="M200 160 C200 160 160 200 180 280" stroke="#0a3a12" strokeWidth="2" fill="none"/>
          <path d="M200 160 C200 160 260 160 300 200" stroke="#0a3a12" strokeWidth="2" fill="none"/>
          <path d="M200 160 C200 160 140 140 120 180" stroke="#0a3a12" strokeWidth="2" fill="none"/>
          {/* Second leaf overlapping */}
          <path d="M40 300 C40 250 80 200 120 160 C140 140 160 100 200 80 C240 60 260 100 240 140 C220 180 180 200 160 240 C140 280 120 320 80 340 C40 360 40 340 40 300Z" fill="#245a28" opacity="0.7"/>
        </svg>

        {/* Top-right palm fronds */}
        <svg className="absolute -top-20 -right-20 w-[600px] h-[600px] opacity-[0.06]" viewBox="0 0 600 600" fill="none">
          <path d="M500 50 C480 80 420 160 380 200 C340 240 280 280 240 300 C200 320 160 320 140 300 C120 280 140 260 180 240 C220 220 280 200 320 160 C360 120 400 60 420 20 C440 -20 500 50 500 50Z" fill="#1a5a22"/>
          <path d="M540 100 C520 140 480 200 440 260 C400 320 340 360 300 380 C260 400 220 380 220 360 C220 340 260 320 300 280 C340 240 400 180 440 120 C480 60 540 100 540 100Z" fill="#2d6b30" opacity="0.6"/>
          <path d="M560 180 C540 220 500 280 460 320 C420 360 380 380 340 380 C300 380 300 360 320 340 C340 320 380 280 420 240 C460 200 520 160 560 180Z" fill="#245a28" opacity="0.5"/>
        </svg>

        {/* Left side hanging leaves */}
        <svg className="absolute top-1/3 -left-24 w-[400px] h-[500px] opacity-[0.05]" viewBox="0 0 400 500" fill="none">
          <path d="M20 100 C60 120 120 180 160 260 C200 340 200 400 180 440 C160 480 120 460 100 420 C80 380 80 300 60 240 C40 180 0 120 20 100Z" fill="#2d6b30"/>
          <path d="M60 60 C100 80 140 140 160 200 C180 260 180 320 160 360 C140 400 100 380 80 340 C60 300 60 240 40 180 C20 120 40 60 60 60Z" fill="#1a5a22" opacity="0.7"/>
        </svg>

        {/* Right side tropical fronds */}
        <svg className="absolute top-1/2 -right-16 w-[400px] h-[500px] opacity-[0.05]" viewBox="0 0 400 500" fill="none">
          <path d="M380 120 C340 140 280 200 240 280 C200 360 200 420 220 460 C240 500 280 480 300 440 C320 400 320 320 340 260 C360 200 400 140 380 120Z" fill="#245a28"/>
          <path d="M360 200 C320 220 280 260 260 320 C240 380 260 420 280 440 C300 460 340 440 340 400 C340 360 360 280 380 220 C400 160 360 200 360 200Z" fill="#2d6b30" opacity="0.6"/>
        </svg>

        {/* Bottom-left foliage */}
        <svg className="absolute -bottom-20 -left-20 w-[500px] h-[400px] opacity-[0.06]" viewBox="0 0 500 400" fill="none">
          <path d="M60 380 C60 340 100 260 160 200 C220 140 280 120 320 140 C360 160 340 200 300 240 C260 280 200 320 140 360 C80 400 60 400 60 380Z" fill="#1a5a22"/>
          <path d="M20 350 C40 300 80 240 140 180 C200 120 260 100 280 120 C300 140 280 180 240 220 C200 260 140 300 80 340 C20 380 0 380 20 350Z" fill="#2d6b30" opacity="0.6"/>
          {/* Large broad leaf */}
          <path d="M160 400 C140 360 140 280 180 220 C220 160 280 140 320 160 C360 180 340 240 300 280 C260 320 220 360 180 400 C160 420 160 420 160 400Z" fill="#245a28" opacity="0.5"/>
        </svg>

        {/* Bottom-right palm */}
        <svg className="absolute -bottom-10 -right-10 w-[450px] h-[400px] opacity-[0.06]" viewBox="0 0 450 400" fill="none">
          <path d="M400 380 C380 340 340 260 280 200 C220 140 160 120 120 140 C80 160 100 200 160 240 C220 280 300 320 360 360 C420 400 420 400 400 380Z" fill="#2d6b30"/>
          <path d="M420 300 C400 260 360 200 300 160 C240 120 200 120 180 140 C160 160 180 200 220 240 C260 280 340 320 400 340 C440 360 440 340 420 300Z" fill="#1a5a22" opacity="0.5"/>
        </svg>

        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,13,8,0.6) 100%)',
        }} />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        {/* Header */}
        <header className="text-center mb-16 pt-8">
          <p className="text-xs tracking-[0.4em] uppercase text-amber-600/50 font-[family-name:var(--font-cormorant)] font-light mb-4">
            Authentic Island Cuisine
          </p>
          <h1 className="text-7xl md:text-9xl font-bold mb-4 font-[family-name:var(--font-playfair)] leading-none">
            <span className="gold-text">Aloha</span>
          </h1>
          <h1 className="text-4xl md:text-5xl font-light mb-6 font-[family-name:var(--font-cormorant)] tracking-[0.15em] text-amber-200/70 uppercase">
            Kitchen
          </h1>
          <div className="tropical-divider w-32 mx-auto mb-5" />
          <p className="text-base text-amber-700/40 font-[family-name:var(--font-cormorant)] font-light italic tracking-wide">
            Fresh from the islands, made with aloha
          </p>
        </header>

        <NameInput />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
          <div className="lg:col-span-2">
            <Menu onOrderPlaced={handleOrderPlaced} hasActiveOrder={hasActiveOrder} />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderQueue userId={userId} onOrdersChange={handleOrdersChange} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-24 mb-12">
          <div className="tropical-divider w-24 mx-auto mb-5" />
          <p className="font-[family-name:var(--font-cormorant)] text-amber-800/30 text-xs tracking-[0.3em] uppercase">
            Mahalo for dining with us
          </p>
        </footer>
      </div>
    </div>
  );
}
