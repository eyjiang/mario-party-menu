"use client";

import { useState } from "react";
import Image from "next/image";
import { drinks } from "@/lib/drinks";
import { Drink } from "@/lib/types";

interface MenuProps {
  onOrderPlaced: () => void;
  hasActiveOrder: boolean;
}

export default function Menu({ onOrderPlaced, hasActiveOrder }: MenuProps) {
  const [ordering, setOrdering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = async (drink: Drink) => {
    setOrdering(drink.id);
    setError(null);

    try {
      const userName = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userName="))
        ?.split("=")[1];

      if (!userName) {
        setError("Please enter your name first");
        setOrdering(null);
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drinkId: drink.id,
          isNonAlcoholic: false,
          userName: decodeURIComponent(userName),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to place order");
        setOrdering(null);
        return;
      }

      onOrderPlaced();
    } catch {
      setError("Failed to place order");
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6 text-center font-[family-name:var(--font-press-start)] text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 animate-pulse drop-shadow-lg">
        🍹 MENU 🍹
      </h2>
      {error && (
        <div className="bg-red-900/50 border-4 border-red-500 rounded-xl p-4 mb-6 text-red-200 text-center font-bold animate-bounce">
          ⚠️ {error} ⚠️
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {drinks.map((drink) => (
          <div
            key={drink.id}
            className={`
              relative overflow-hidden
              bg-gradient-to-br ${drink.color}
              rounded-2xl p-5 text-white
              shadow-2xl ${drink.glowColor}/50
              border-4 ${drink.borderColor}
              transform hover:scale-105 hover:rotate-1
              transition-all duration-300 ease-out
              hover:shadow-3xl
              flex flex-col
              min-h-[380px]
              group
            `}
          >
            {/* Sparkle effects */}
            <div className="absolute top-2 right-2 text-2xl animate-spin-slow opacity-80">✨</div>
            <div className="absolute bottom-20 left-2 text-xl animate-bounce opacity-60">⭐</div>

            {/* Character image */}
            <div className="absolute -right-4 -top-4 w-32 h-32 opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300 pointer-events-none">
              <Image
                src={drink.image}
                alt={drink.name}
                width={128}
                height={128}
                className="object-contain drop-shadow-lg"
              />
            </div>

            {/* Emoji decoration */}
            <div className="text-4xl mb-2 animate-bounce">{drink.emoji}</div>

            {/* Drink name with custom font */}
            <h3 className={`text-2xl font-bold mb-3 ${drink.fontClass} drop-shadow-lg leading-tight`}>
              {drink.name}
            </h3>

            {/* Ingredients */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-3 flex-grow">
              <ul className="text-sm space-y-1">
                {drink.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-yellow-300">▸</span>
                    <span className="opacity-90">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* NA badge */}
            {drink.hasNaOption && (
              <div className="absolute top-3 left-3 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
                🚫🍺 NA Available
              </div>
            )}

            {/* Order button at bottom */}
            <button
              onClick={() => placeOrder(drink)}
              disabled={ordering !== null || hasActiveOrder}
              className={`
                w-full mt-auto
                bg-white/30 hover:bg-white/50
                disabled:bg-white/10 disabled:cursor-not-allowed
                backdrop-blur-md
                px-6 py-3 rounded-xl
                font-bold text-lg
                transition-all duration-200
                border-2 border-white/50
                shadow-lg hover:shadow-xl
                transform hover:-translate-y-1
                active:translate-y-0
                ${ordering === drink.id ? "animate-pulse" : ""}
              `}
            >
              {ordering === drink.id ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🌀</span> Ordering...
                </span>
              ) : hasActiveOrder ? (
                <span className="flex items-center justify-center gap-2">
                  ⏳ Order Pending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🛒 ORDER NOW!
                </span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
