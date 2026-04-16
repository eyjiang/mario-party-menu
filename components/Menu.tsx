"use client";

import { useState } from "react";
import { drinks } from "@/lib/drinks";
import { Drink } from "@/lib/types";

interface MenuProps {
  category: "drinks" | "food";
  onOrderPlaced: () => void;
  hasActiveOrder: boolean;
}

const OrderModal = ({
  drink,
  onClose,
  onOrder,
  isOrdering,
  hasActiveOrder,
  selectedOptions,
  onToggleOption,
  comment,
  onCommentChange,
}: {
  drink: Drink;
  onClose: () => void;
  onOrder: () => void;
  isOrdering: boolean;
  hasActiveOrder: boolean;
  selectedOptions: string[];
  onToggleOption: (optionId: string) => void;
  comment: string;
  onCommentChange: (c: string) => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="menu-card p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl transition-colors"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-1 pr-8">
          {drink.name}
          {drink.isNonAlcoholic && (
            <span className="text-sm font-normal text-gray-500 ml-2">(Non-Alcoholic)</span>
          )}
        </h2>

        <p className="text-sm text-gray-500 mb-1">
          {drink.ingredients.join(", ")}
        </p>

        {drink.allergens.length > 0 && (
          <p className="text-xs text-gray-400 mb-3">
            &rarr; Allergens: {drink.allergens.join(", ")}
          </p>
        )}
        {drink.allergens.length === 0 && (
          <p className="text-xs text-gray-400 mb-3">
            &rarr; Allergens: None
          </p>
        )}

        {/* Options */}
        {drink.options && drink.options.length > 0 && (
          <div className="mb-4 space-y-2">
            {drink.options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(opt.id)}
                  onChange={() => onToggleOption(opt.id)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400 accent-blue-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        )}

        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value.slice(0, 800))}
          placeholder="Any other notes..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 resize-none mb-4"
          rows={2}
        />

        <button
          onClick={onOrder}
          disabled={isOrdering || hasActiveOrder}
          className="w-full py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#5a6f8e] hover:bg-[#4d6180] text-white"
        >
          {isOrdering ? "Placing order..." : hasActiveOrder ? "Order already placed" : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default function Menu({ category, onOrderPlaced, hasActiveOrder }: MenuProps) {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [ordering, setOrdering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optionSelections, setOptionSelections] = useState<Record<string, string[]>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const items = drinks.filter((d) => d.category === category);

  const toggleOption = (drinkId: string, optionId: string) => {
    setOptionSelections((prev) => {
      const current = prev[drinkId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [drinkId]: current.filter((o) => o !== optionId) };
      }
      return { ...prev, [drinkId]: [...current, optionId] };
    });
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

      // Build comment with selected options
      const selected = optionSelections[drink.id] || [];
      const optionLabels = selected
        .map((optId) => drink.options?.find((o) => o.id === optId)?.label)
        .filter(Boolean);
      const baseComment = comments[drink.id] || "";
      const fullComment = optionLabels.length > 0
        ? `[${optionLabels.join(", ")}]${baseComment ? " " + baseComment : ""}`
        : baseComment;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drinkId: drink.id,
          isNonAlcoholic: false,
          comment: fullComment,
          userName: decodeURIComponent(userName),
          selectedOptions: selected,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to place order");
        setOrdering(null);
        return;
      }

      setComments((prev) => ({ ...prev, [drink.id]: "" }));
      setOptionSelections((prev) => ({ ...prev, [drink.id]: [] }));
      setSelectedDrink(null);
      onOrderPlaced();
    } catch {
      setError("Failed to place order");
    } finally {
      setOrdering(null);
    }
  };

  return (
    <div>
      {/* Section header */}
      <h2 className="text-5xl md:text-6xl font-[family-name:var(--font-great-vibes)] text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.2)] mb-6">
        {category === "drinks" ? "Drinks" : "Food"}
      </h2>

      {error && (
        <div className="menu-card p-3 mb-4 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {items.map((drink, index) => (
          <button
            key={drink.id}
            onClick={() => setSelectedDrink(drink)}
            className="menu-card w-full text-left p-5 cursor-pointer"
            style={{
              // Slight staggered offset like the image
              marginLeft: index % 2 === 1 ? "12px" : "0",
              marginRight: index % 2 === 0 ? "12px" : "0",
            }}
          >
            <h3 className="font-bold text-gray-900 text-base mb-1">
              {drink.name}
              {drink.isNonAlcoholic && (
                <span className="text-sm font-normal text-gray-500 ml-1.5">(Non-Alcoholic)</span>
              )}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-1.5">
              {drink.ingredients.join(", ")}
            </p>
            <p className="text-xs text-gray-400">
              &rarr; Allergens: {drink.allergens.length > 0 ? drink.allergens.join(", ") : "None"}
            </p>
            {drink.notes && (
              <p className="text-xs text-gray-500 mt-1 italic">
                *{drink.notes}
              </p>
            )}
          </button>
        ))}
      </div>

      {selectedDrink && (
        <OrderModal
          drink={selectedDrink}
          onClose={() => setSelectedDrink(null)}
          onOrder={() => placeOrder(selectedDrink)}
          isOrdering={ordering === selectedDrink.id}
          hasActiveOrder={hasActiveOrder}
          selectedOptions={optionSelections[selectedDrink.id] || []}
          onToggleOption={(optId) => toggleOption(selectedDrink.id, optId)}
          comment={comments[selectedDrink.id] || ""}
          onCommentChange={(c) => setComments((prev) => ({ ...prev, [selectedDrink.id]: c }))}
        />
      )}
    </div>
  );
}
