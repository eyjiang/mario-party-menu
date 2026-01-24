"use client";

import { useState, useEffect, useRef } from "react";
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
  const [naSelections, setNaSelections] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const shuffleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleNa = (drinkId: string) => {
    setNaSelections((prev) => ({ ...prev, [drinkId]: !prev[drinkId] }));
  };

  const updateComment = (drinkId: string, comment: string) => {
    // Limit to ~140 words (roughly 800 chars)
    if (comment.length <= 800) {
      setComments((prev) => ({ ...prev, [drinkId]: comment }));
    }
  };

  const randomDrink = () => {
    if (isShuffling || hasActiveOrder) return;

    setIsShuffling(true);
    let iterations = 0;
    const totalIterations = 20 + Math.floor(Math.random() * 10); // 20-30 iterations
    const finalIndex = Math.floor(Math.random() * drinks.length);

    const shuffle = () => {
      iterations++;
      const currentIndex = iterations % drinks.length;
      setHighlightedIndex(currentIndex);

      if (iterations < totalIterations) {
        // Speed up then slow down
        const progress = iterations / totalIterations;
        const delay = 50 + Math.pow(progress, 2) * 300; // 50ms to 350ms
        shuffleTimeoutRef.current = setTimeout(shuffle, delay);
      } else {
        // Land on final selection
        setHighlightedIndex(finalIndex);
        setTimeout(() => {
          setIsShuffling(false);
        }, 2000);
      }
    };

    shuffle();
  };

  useEffect(() => {
    return () => {
      if (shuffleTimeoutRef.current) {
        clearTimeout(shuffleTimeoutRef.current);
      }
    };
  }, []);

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
          isNonAlcoholic: naSelections[drink.id] || false,
          comment: comments[drink.id] || "",
          userName: decodeURIComponent(userName),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to place order");
        setOrdering(null);
        return;
      }

      // Clear the comment after ordering
      setComments((prev) => ({ ...prev, [drink.id]: "" }));
      onOrderPlaced();
    } catch {
      setError("Failed to place order");
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <h2 className="text-4xl font-bold text-center font-[family-name:var(--font-press-start)] text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 animate-pulse drop-shadow-lg">
          MENU
        </h2>
        <button
          onClick={randomDrink}
          disabled={isShuffling || hasActiveOrder}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg animate-pulse disabled:animate-none"
        >
          🎲 RANDOM DRINK
        </button>
      </div>
      {error && (
        <div className="bg-red-900/50 border-4 border-red-500 rounded-xl p-4 mb-6 text-red-200 text-center font-bold animate-bounce">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 p-2">
        {drinks.map((drink, index) => (
          <div
            key={drink.id}
            className={`
              relative overflow-hidden
              bg-gradient-to-br ${drink.color}
              rounded-2xl p-6 text-white
              shadow-2xl ${drink.glowColor}/50
              border-4 ${highlightedIndex === index ? "border-yellow-300 ring-4 ring-yellow-400 scale-105" : drink.borderColor}
              transform hover:scale-105 hover:rotate-1
              transition-all duration-300 ease-out
              hover:shadow-3xl
              flex flex-col
              min-h-[380px]
              group
              ${highlightedIndex === index && !isShuffling ? "animate-pulse" : ""}
            `}
          >
            {/* Sparkle effects */}
            <div className="absolute top-2 right-2 text-2xl animate-spin-slow opacity-80 hidden sm:block">✨</div>
            <div className="absolute bottom-24 left-2 text-xl animate-bounce opacity-60">⭐</div>

            {/* Character image - hidden on mobile, visible on larger screens */}
            <div className="absolute -right-4 -top-4 w-24 h-24 sm:w-32 sm:h-32 opacity-0 sm:opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300 pointer-events-none">
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

            {/* Ingredients + Comment area */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 mb-4 flex-grow flex flex-col gap-3">
              <p className="text-sm opacity-90 leading-relaxed">
                {drink.ingredients.join(" | ")}
              </p>
              <textarea
                value={comments[drink.id] || ""}
                onChange={(e) => updateComment(drink.id, e.target.value)}
                placeholder="Add a note... (optional)"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 resize-none"
                rows={2}
                maxLength={800}
              />
            </div>

            {/* Order button with NA checkbox */}
            <div className="flex items-center gap-3 mt-auto">
              {drink.hasNaOption && (
                <label className="flex items-center gap-1.5 cursor-pointer bg-black/30 backdrop-blur-sm px-3 py-3 rounded-xl border border-white/30 hover:bg-black/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={naSelections[drink.id] || false}
                    onChange={() => toggleNa(drink.id)}
                    className="w-5 h-5 rounded accent-blue-500"
                  />
                  <span className="text-xs font-bold whitespace-nowrap">NA</span>
                </label>
              )}
              <button
                onClick={() => placeOrder(drink)}
                disabled={ordering !== null || hasActiveOrder}
                className={`
                  flex-1
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
                  <span className="flex items-center justify-center gap-2 text-green-300">
                    ✓ ORDER PLACED
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    ORDER
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
