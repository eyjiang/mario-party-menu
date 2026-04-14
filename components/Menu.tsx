"use client";

import { useState } from "react";
import { drinks } from "@/lib/drinks";
import { Drink } from "@/lib/types";

interface MenuProps {
  onOrderPlaced: () => void;
  hasActiveOrder: boolean;
}

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
      className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0c1a10] border border-amber-800/20 rounded-2xl p-8 max-w-md w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-20 h-[1px] bg-gradient-to-r from-amber-600/40 to-transparent" />
        <div className="absolute top-0 left-0 w-[1px] h-20 bg-gradient-to-b from-amber-600/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-20 h-[1px] bg-gradient-to-l from-amber-600/40 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[1px] h-20 bg-gradient-to-t from-amber-600/40 to-transparent" />

        <div className="mb-8">
          <h2 className="text-3xl font-bold font-[family-name:var(--font-playfair)] gold-text mb-3">
            {drink.name}
          </h2>
          <p className="text-amber-600/50 font-[family-name:var(--font-cormorant)] text-lg italic leading-relaxed">
            {drink.ingredients.join(" \u00B7 ")}
          </p>
        </div>

        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value.slice(0, 800))}
            placeholder="Special requests..."
            className="w-full bg-black/20 border border-amber-900/20 rounded-lg px-4 py-3 text-sm text-amber-50/80 placeholder-amber-800/30 focus:outline-none focus:border-amber-700/40 resize-none font-[family-name:var(--font-cormorant)]"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3">
          {drink.hasNaOption && (
            <label className="flex items-center gap-2 cursor-pointer bg-black/20 px-4 py-3 rounded-xl border border-amber-900/20">
              <input
                type="checkbox"
                checked={naSelection}
                onChange={onToggleNa}
                className="w-4 h-4 rounded accent-amber-600"
              />
              <span className="text-sm font-[family-name:var(--font-cormorant)] text-amber-300/70">Keiki Size</span>
            </label>
          )}
          <button
            onClick={onOrder}
            disabled={isOrdering || hasActiveOrder}
            className="flex-1 py-3 rounded-xl font-[family-name:var(--font-cormorant)] font-semibold text-base tracking-[0.15em] uppercase transition-all disabled:opacity-40 border border-amber-700/30 hover:border-amber-600/50"
            style={{
              backgroundColor: hasActiveOrder ? "rgba(30,30,30,0.5)" : "rgba(139, 90, 43, 0.2)",
              color: hasActiveOrder ? "rgba(160,160,160,0.5)" : "#d4a840",
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
          className="absolute top-4 right-5 text-amber-800/40 hover:text-amber-400/60 text-xl transition-colors"
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

  const mainDishes = drinks.filter((d) => d.id !== "haupia");
  const desserts = drinks.filter((d) => d.id === "haupia");

  const renderSection = (title: string, items: Drink[]) => (
    <div className="mb-14">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-[family-name:var(--font-playfair)] gold-text tracking-wide uppercase">
          {title}
        </h2>
        <div className="tropical-divider w-16 mt-3" />
      </div>

      <div className="space-y-1">
        {items.map((drink) => (
          <button
            key={drink.id}
            onClick={() => setSelectedDrink(drink)}
            className="menu-item w-full text-left py-5 px-1 rounded-lg group cursor-pointer"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-[family-name:var(--font-playfair)] font-semibold text-amber-100/90 group-hover:text-amber-50 transition-colors">
                {drink.name}
              </h3>
              <div className="flex-1 border-b border-dotted border-amber-800/15 mb-1 min-w-[40px]" />
              <span className="text-base font-[family-name:var(--font-cormorant)] text-amber-500/60 flex-shrink-0">
                Market
              </span>
            </div>
            <p className="text-sm text-amber-600/35 font-[family-name:var(--font-cormorant)] mt-1.5 leading-relaxed italic pr-20">
              {drink.ingredients.join(", ")}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {error && (
        <div className="border border-red-900/30 rounded-lg p-3 mb-6 text-red-300/70 text-center text-sm font-[family-name:var(--font-cormorant)]">
          {error}
        </div>
      )}

      {renderSection("Plates", mainDishes)}
      {desserts.length > 0 && renderSection("Desserts", desserts)}

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
