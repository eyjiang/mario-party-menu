"use client";

import { useState } from "react";
import { drinks } from "@/lib/drinks";
import { Drink } from "@/lib/types";

interface MenuProps {
  onOrderPlaced: () => void;
  hasActiveOrder: boolean;
}

export default function Menu({ onOrderPlaced, hasActiveOrder }: MenuProps) {
  const [naSelections, setNaSelections] = useState<Record<string, boolean>>({});
  const [ordering, setOrdering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleNa = (drinkId: string) => {
    setNaSelections((prev) => ({ ...prev, [drinkId]: !prev[drinkId] }));
  };

  const placeOrder = async (drink: Drink) => {
    setOrdering(drink.id);
    setError(null);

    try {
      // Get userName from cookie
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
      <h2 className="text-2xl font-bold mb-4">Menu</h2>
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4 text-red-200">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {drinks.map((drink) => (
          <div
            key={drink.id}
            className={`bg-gradient-to-br ${drink.color} rounded-lg p-4 text-white shadow-lg`}
          >
            <h3 className="text-xl font-bold mb-2">{drink.name}</h3>
            <p className="text-sm opacity-90 mb-3">
              {drink.ingredients.join(" • ")}
            </p>

            {drink.hasNaOption && (
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={naSelections[drink.id] || false}
                  onChange={() => toggleNa(drink.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Non-alcoholic</span>
              </label>
            )}

            <button
              onClick={() => placeOrder(drink)}
              disabled={ordering !== null || hasActiveOrder}
              className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed backdrop-blur-sm px-4 py-2 rounded font-medium transition-colors"
            >
              {ordering === drink.id
                ? "Ordering..."
                : hasActiveOrder
                  ? "Order pending..."
                  : "Order"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
