"use client";

import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Link from "next/link";
import Menu from "@/components/Menu";
import OrderQueue from "@/components/OrderQueue";

export default function Home() {
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="))
      ?.split("=")[1];
    if (existing) {
      setUserId(existing);
    } else {
      const newId = uuidv4();
      document.cookie = `userId=${newId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
      setUserId(newId);
    }
  }, []);

  return (
    <div className="min-h-screen relative z-10">
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

        {/* Public order queue */}
        {userId && (
          <div className="mt-14">
            <OrderQueue userId={userId} />
          </div>
        )}

        <footer className="text-center mt-16 mb-8">
          <p className="text-xl md:text-2xl font-[family-name:var(--font-satisfy)] text-white/70 drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]">
            Menu graciously designed by Iris Xie ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}
