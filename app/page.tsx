"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Menu from "@/components/Menu";

export default function Home() {
  useEffect(() => {
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="));
    if (!existing) {
      const newId = uuidv4();
      document.cookie = `userId=${newId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    }
  }, []);

  return (
    <div className="min-h-screen relative z-10">
      {/* Palm frond SVG overlays */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute -bottom-8 -left-12 w-[600px] h-[500px] opacity-[0.18]" viewBox="0 0 600 500" fill="none">
          <path d="M-20 500 C0 460 40 380 100 320 C140 280 200 240 240 220 C280 200 320 200 340 220 C360 240 340 270 300 290 C260 310 200 330 160 370 C120 410 60 470 -20 500Z" fill="#2d5a1e"/>
          <path d="M-40 480 C-10 430 50 360 120 300 C160 260 220 220 260 210 C300 200 330 210 330 230 C330 250 300 270 260 290 C220 310 160 340 100 390 C40 440 -20 480 -40 480Z" fill="#3a7025"/>
          <path d="M20 500 C40 470 80 410 140 360 C180 330 230 300 270 290 C310 280 330 290 320 310 C310 330 280 350 240 370 C200 390 140 420 80 460 C40 490 20 500 20 500Z" fill="#2a5520" opacity="0.7"/>
          <path d="M-20 500 C60 420 160 340 280 260" stroke="#1a4015" strokeWidth="1.5" fill="none" opacity="0.4"/>
        </svg>
        <svg className="absolute -bottom-8 -right-12 w-[600px] h-[500px] opacity-[0.18]" viewBox="0 0 600 500" fill="none" style={{ transform: 'scaleX(-1)' }}>
          <path d="M-20 500 C0 460 40 380 100 320 C140 280 200 240 240 220 C280 200 320 200 340 220 C360 240 340 270 300 290 C260 310 200 330 160 370 C120 410 60 470 -20 500Z" fill="#2d5a1e"/>
          <path d="M-40 480 C-10 430 50 360 120 300 C160 260 220 220 260 210 C300 200 330 210 330 230 C330 250 300 270 260 290 C220 310 160 340 100 390 C40 440 -20 480 -40 480Z" fill="#3a7025"/>
          <path d="M20 500 C40 470 80 410 140 360 C180 330 230 300 270 290 C310 280 330 290 320 310 C310 330 280 350 240 370 C200 390 140 420 80 460 C40 490 20 500 20 500Z" fill="#2a5520" opacity="0.7"/>
        </svg>
        <svg className="absolute -top-4 -left-8 w-[350px] h-[300px] opacity-[0.08]" viewBox="0 0 350 300" fill="none">
          <path d="M0 0 C30 30 80 80 120 140 C140 180 150 220 140 250 C130 280 100 270 90 240 C80 210 80 160 60 110 C40 60 10 20 0 0Z" fill="#3a7025"/>
          <path d="M30 0 C50 30 90 80 120 130 C140 160 150 200 140 230 C130 260 110 250 100 220 C90 190 90 150 70 100 C50 50 30 20 30 0Z" fill="#2d5a1e" opacity="0.6"/>
        </svg>
        <svg className="absolute -top-4 -right-8 w-[350px] h-[300px] opacity-[0.08]" viewBox="0 0 350 300" fill="none" style={{ transform: 'scaleX(-1)' }}>
          <path d="M0 0 C30 30 80 80 120 140 C140 180 150 220 140 250 C130 280 100 270 90 240 C80 210 80 160 60 110 C40 60 10 20 0 0Z" fill="#3a7025"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <header className="text-center mb-6 pt-4">
          <h1 className="text-7xl md:text-9xl font-[family-name:var(--font-great-vibes)] text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.25)] leading-tight">
            Lei&apos;d back
          </h1>
          <h1 className="text-6xl md:text-8xl font-[family-name:var(--font-great-vibes)] text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.25)] -mt-4 leading-tight">
            Bites & Bevs
          </h1>
        </header>

        {/* Ordering rules */}
        <div className="menu-card max-w-xl mx-auto mb-8 px-5 py-4 text-center">
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Each guest may order <strong>one drink</strong> and{" "}
            <strong>up to two of the three food items</strong>.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Please only one order per person.
          </p>
        </div>

        {/* Two-column menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2 mt-2">
          <Menu category="food" />
          <Menu category="drinks" />
        </div>

        {/* Place order CTA */}
        <div className="flex justify-center mt-12">
          <Link
            href="/order"
            className="inline-block px-10 py-4 rounded-2xl bg-[#5a6f8e] hover:bg-[#4d6180] text-white text-xl md:text-2xl font-semibold tracking-wide shadow-lg hover:shadow-xl transition-all"
          >
            Place your order →
          </Link>
        </div>

        <footer className="text-center mt-16 mb-8">
          <p className="text-xl md:text-2xl font-[family-name:var(--font-satisfy)] text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]">
            Menu graciously designed by Iris Xie ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}
