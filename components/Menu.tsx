"use client";

import { useState } from "react";
import { drinks } from "@/lib/drinks";
import { Drink } from "@/lib/types";

interface MenuProps {
  onOrderPlaced: () => void;
  hasActiveOrder: boolean;
}

// Modal component
const OrderModal = ({
  drink,
  onClose,
  onOrder,
  isOrdering,
  hasActiveOrder,
  naSelection,
  onToggleNa,
  comment,
  onCommentChange,
}: {
  drink: Drink;
  onClose: () => void;
  onOrder: () => void;
  isOrdering: boolean;
  hasActiveOrder: boolean;
  naSelection: boolean;
  onToggleNa: () => void;
  comment: string;
  onCommentChange: (c: string) => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="hawaiian-card rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-[1px] bg-gradient-to-r from-amber-600/50 to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-16 bg-gradient-to-b from-amber-600/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-16 h-[1px] bg-gradient-to-l from-amber-600/50 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[1px] h-16 bg-gradient-to-t from-amber-600/50 to-transparent" />

        <div className="mb-6">
          <div className="text-4xl mb-3">{drink.emoji}</div>
          <h2 className="text-3xl font-bold font-[family-name:var(--font-playfair)] gold-text mb-2">
            {drink.name}
          </h2>
          <p className="text-amber-700/60 font-[family-name:var(--font-cormorant)] text-lg italic">
            {drink.ingredients.join(" \u00B7 ")}
          </p>
        </div>

        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value.slice(0, 800))}
            placeholder="Special requests... (optional)"
            className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-4 py-3 text-sm text-amber-50 placeholder-amber-800/40 focus:outline-none focus:border-amber-600/50 resize-none font-[family-name:var(--font-cormorant)]"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3">
          {drink.hasNaOption && (
            <label className="flex items-center gap-2 cursor-pointer bg-black/30 px-4 py-3 rounded-xl border border-amber-900/30">
              <input
                type="checkbox"
                checked={naSelection}
                onChange={onToggleNa}
                className="w-5 h-5 rounded accent-amber-500"
              />
              <span className="text-sm font-[family-name:var(--font-cormorant)] text-amber-200">Keiki Size</span>
            </label>
          )}
          <button
            onClick={onOrder}
            disabled={isOrdering || hasActiveOrder}
            className="flex-1 py-3 rounded-xl font-[family-name:var(--font-cormorant)] font-bold text-lg tracking-wider uppercase transition-all disabled:opacity-50"
            style={{
              backgroundColor: hasActiveOrder ? "#374151" : "#8b5a2b",
              color: hasActiveOrder ? "#9ca3af" : "#f5f0e8",
            }}
          >
            {isOrdering ? (
              <span className="animate-pulse">Placing Order...</span>
            ) : hasActiveOrder ? (
              <span>Order Placed</span>
            ) : (
              "Place Order"
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-700/50 hover:text-amber-200 text-2xl w-8 h-8 flex items-center justify-center transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default function Menu({ onOrderPlaced, hasActiveOrder }: MenuProps) {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [naSelections, setNaSelections] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const toggleNa = (drinkId: string) => {
    setNaSelections((prev) => ({ ...prev, [drinkId]: !prev[drinkId] }));
  };

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

      setComments((prev) => ({ ...prev, [drink.id]: "" }));
      setSelectedDrink(null);
      onOrderPlaced();
    } catch {
      setError("Failed to place order");
    } finally {
      setOrdering(null);
    }
  };

  // Split into main dishes and dessert
  const mainDishes = drinks.filter((d) => d.id !== "haupia");
  const desserts = drinks.filter((d) => d.id === "haupia");

  return (
    <div>
      {error && (
        <div className="hawaiian-card rounded-xl p-4 mb-6 text-red-300 text-center font-[family-name:var(--font-cormorant)] border-red-900/50">
          {error}
        </div>
      )}

      {/* Main Dishes Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold font-[family-name:var(--font-playfair)] gold-text tracking-wide uppercase">
            Plates
          </h2>
          <div className="tropical-divider w-24 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainDishes.map((drink) => (
            <button
              key={drink.id}
              onClick={() => setSelectedDrink(drink)}
              className="hawaiian-card rounded-xl p-6 text-left transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{drink.emoji}</span>
                    <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-amber-100 group-hover:text-amber-50 transition-colors">
                      {drink.name}
                    </h3>
                  </div>
                  <p className="text-sm text-amber-700/50 font-[family-name:var(--font-cormorant)] leading-relaxed italic">
                    {drink.ingredients.join(", ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-[family-name:var(--font-cormorant)] font-semibold text-amber-400">
                    Market
                  </span>
                </div>
              </div>
              <div className="tropical-divider mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Desserts Section */}
      {desserts.length > 0 && (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold font-[family-name:var(--font-playfair)] gold-text tracking-wide uppercase">
              Desserts
            </h2>
            <div className="tropical-divider w-24 mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {desserts.map((drink) => (
              <button
                key={drink.id}
                onClick={() => setSelectedDrink(drink)}
                className="hawaiian-card rounded-xl p-6 text-left transition-all duration-300 hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{drink.emoji}</span>
                      <h3 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-amber-100 group-hover:text-amber-50 transition-colors">
                        {drink.name}
                      </h3>
                    </div>
                    <p className="text-sm text-amber-700/50 font-[family-name:var(--font-cormorant)] leading-relaxed italic">
                      {drink.ingredients.join(", ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-[family-name:var(--font-cormorant)] font-semibold text-amber-400">
                      Market
                    </span>
                  </div>
                </div>
                <div className="tropical-divider mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Modal */}
      {selectedDrink && (
        <OrderModal
          drink={selectedDrink}
          onClose={() => setSelectedDrink(null)}
          onOrder={() => placeOrder(selectedDrink)}
          isOrdering={ordering === selectedDrink.id}
          hasActiveOrder={hasActiveOrder}
          naSelection={naSelections[selectedDrink.id] || false}
          onToggleNa={() => toggleNa(selectedDrink.id)}
          comment={comments[selectedDrink.id] || ""}
          onCommentChange={(c) => setComments((prev) => ({ ...prev, [selectedDrink.id]: c }))}
        />
      )}
    </div>
  );
}
