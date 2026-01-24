"use client";

import { useState, useEffect, useRef } from "react";
import { drinks } from "@/lib/drinks";
import { Drink } from "@/lib/types";

interface MenuProps {
  onOrderPlaced: () => void;
  hasActiveOrder: boolean;
}

// 8-bit color palettes for each drink
const drinkPixelColors: Record<string, string[]> = {
  "yoshis-egg": ["#4ade80", "#22c55e", "#15803d", "#ffffff"],
  "waluigi-tales-flight": ["#a855f7", "#7c3aed", "#581c87", "#c084fc"],
  "brothers-highball": ["#ef4444", "#22c55e", "#dc2626", "#16a34a"],
  "marios-bawlz": ["#ef4444", "#f97316", "#fbbf24", "#dc2626"],
  "daisy": ["#fbbf24", "#f97316", "#fb923c", "#fef3c7"],
  "bowser-bomb": ["#ea580c", "#dc2626", "#92400e", "#fbbf24"],
  "donkey-kong": ["#d97706", "#92400e", "#fbbf24", "#78350f"],
  "bowser-space": ["#6b21a8", "#1f2937", "#581c87", "#374151"],
};

// Simple 8-bit drink representations (8x8 pixel patterns)
const DrinkPixelArt = ({ drink, size = 64 }: { drink: Drink; size?: number }) => {
  const colors = drinkPixelColors[drink.id] || ["#888", "#666", "#444", "#aaa"];
  const pixelSize = size / 8;

  // Different patterns for each drink type
  const patterns: Record<string, number[][]> = {
    "yoshis-egg": [
      [0,0,1,1,1,1,0,0],
      [0,1,3,3,3,3,1,0],
      [1,3,3,1,1,3,3,1],
      [1,3,1,0,0,1,3,1],
      [1,3,1,0,0,1,3,1],
      [1,3,3,1,1,3,3,1],
      [0,1,3,3,3,3,1,0],
      [0,0,1,1,1,1,0,0],
    ],
    "waluigi-tales-flight": [
      [0,0,0,1,1,0,0,0],
      [0,0,1,2,2,1,0,0],
      [0,1,2,3,3,2,1,0],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,2,2,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,1,1,0,0,0],
    ],
    "brothers-highball": [
      [0,0,1,1,1,1,0,0],
      [0,1,0,0,0,0,1,0],
      [0,1,2,2,2,2,1,0],
      [0,1,2,0,0,2,1,0],
      [0,1,0,2,2,0,1,0],
      [0,1,0,0,0,0,1,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
    ],
    "marios-bawlz": [
      [0,0,1,1,1,1,0,0],
      [0,1,0,0,0,0,1,0],
      [1,0,2,0,0,2,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,3,0,0,3,0,1],
      [1,0,0,3,3,0,0,1],
      [0,1,0,0,0,0,1,0],
      [0,0,1,1,1,1,0,0],
    ],
    "daisy": [
      [0,0,0,1,1,0,0,0],
      [0,1,0,2,2,0,1,0],
      [0,0,2,3,3,2,0,0],
      [1,2,3,3,3,3,2,1],
      [1,2,3,3,3,3,2,1],
      [0,0,2,3,3,2,0,0],
      [0,1,0,2,2,0,1,0],
      [0,0,0,1,1,0,0,0],
    ],
    "bowser-bomb": [
      [0,0,0,1,1,0,0,0],
      [0,0,1,3,3,1,0,0],
      [0,1,0,0,0,0,1,0],
      [1,0,2,0,0,2,0,1],
      [1,0,0,0,0,0,0,1],
      [1,0,2,2,2,2,0,1],
      [0,1,0,0,0,0,1,0],
      [0,0,1,1,1,1,0,0],
    ],
    "donkey-kong": [
      [0,1,1,1,1,1,1,0],
      [1,2,2,2,2,2,2,1],
      [1,2,3,2,2,3,2,1],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,2,2,1,0,0],
      [0,0,1,2,2,1,0,0],
      [0,0,0,1,1,0,0,0],
    ],
    "bowser-space": [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,3,2,2,3,2,1],
      [1,2,2,2,2,2,2,1],
      [1,2,2,3,3,2,2,1],
      [1,2,2,2,2,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,1,1,1,0,0],
    ],
  };

  const pattern = patterns[drink.id] || patterns["yoshis-egg"];

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    >
      {pattern.map((row, y) => (
        row.map((colorIdx, x) => (
          colorIdx > 0 && (
            <div
              key={`${x}-${y}`}
              style={{
                position: "absolute",
                left: x * pixelSize,
                top: y * pixelSize,
                width: pixelSize,
                height: pixelSize,
                backgroundColor: colors[colorIdx - 1],
              }}
            />
          )
        ))
      ))}
    </div>
  );
};

// Simple L-shaped revolver pointing RIGHT (barrel points at drinks when rotated)
const PixelRevolver = () => {
  return (
    <div style={{ width: 80, height: 80 }}>
      <svg viewBox="0 0 20 20" className="w-full h-full" style={{ imageRendering: "pixelated" }}>
        {/* Barrel - pointing RIGHT */}
        <rect x="8" y="6" width="12" height="3" fill="#374151" />
        <rect x="8" y="7" width="12" height="1" fill="#4b5563" />
        <rect x="18" y="6" width="2" height="3" fill="#1f2937" />
        {/* Front sight */}
        <rect x="19" y="5" width="1" height="1" fill="#6b7280" />

        {/* Body/Frame */}
        <rect x="5" y="6" width="5" height="5" fill="#4b5563" />
        <rect x="6" y="7" width="3" height="3" fill="#6b7280" />

        {/* Cylinder */}
        <rect x="7" y="5" width="3" height="1" fill="#374151" />
        <rect x="7" y="11" width="3" height="1" fill="#374151" />

        {/* Grip - pointing DOWN */}
        <rect x="5" y="11" width="4" height="7" fill="#78350f" />
        <rect x="6" y="12" width="2" height="5" fill="#92400e" />
        <rect x="5" y="17" width="4" height="2" fill="#5c2d0e" />

        {/* Trigger guard */}
        <rect x="9" y="11" width="1" height="4" fill="#374151" />
        <rect x="9" y="14" width="2" height="1" fill="#374151" />

        {/* Trigger */}
        <rect x="10" y="12" width="1" height="2" fill="#1f2937" />

        {/* Hammer */}
        <rect x="4" y="6" width="2" height="2" fill="#4b5563" />
        <rect x="3" y="7" width="1" height="1" fill="#374151" />
      </svg>
    </div>
  );
};

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
  const colors = drinkPixelColors[drink.id] || ["#888", "#666", "#444", "#aaa"];

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border-4 relative overflow-hidden"
        style={{ borderColor: colors[0] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pixel decoration corners */}
        <div className="absolute top-0 left-0 w-4 h-4" style={{ backgroundColor: colors[1] }} />
        <div className="absolute top-0 right-0 w-4 h-4" style={{ backgroundColor: colors[1] }} />
        <div className="absolute bottom-0 left-0 w-4 h-4" style={{ backgroundColor: colors[1] }} />
        <div className="absolute bottom-0 right-0 w-4 h-4" style={{ backgroundColor: colors[1] }} />

        <div className="flex items-center gap-4 mb-4">
          <DrinkPixelArt drink={drink} size={80} />
          <div>
            <h2 className={`text-2xl font-bold ${drink.fontClass}`} style={{ color: colors[0] }}>
              {drink.name}
            </h2>
            <p className="text-4xl">{drink.emoji}</p>
          </div>
        </div>

        <div className="bg-black/50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300 mb-3">
            {drink.ingredients.join(" | ")}
          </p>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value.slice(0, 800))}
            placeholder="Add a note... (optional)"
            className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 resize-none"
            rows={2}
          />
        </div>

        <div className="flex items-center gap-3">
          {drink.hasNaOption && (
            <label className="flex items-center gap-2 cursor-pointer bg-black/50 px-4 py-3 rounded-xl border border-gray-600">
              <input
                type="checkbox"
                checked={naSelection}
                onChange={onToggleNa}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <span className="text-sm font-bold">NA</span>
            </label>
          )}
          <button
            onClick={onOrder}
            disabled={isOrdering || hasActiveOrder}
            className="flex-1 py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50"
            style={{
              backgroundColor: hasActiveOrder ? "#374151" : colors[0],
              color: "#000",
            }}
          >
            {isOrdering ? (
              <span className="animate-pulse">ORDERING...</span>
            ) : hasActiveOrder ? (
              <span>✓ ORDER PLACED</span>
            ) : (
              "ORDER"
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
        >
          ×
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
  const [gunRotation, setGunRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef<number | null>(null);
  const gunRef = useRef<HTMLDivElement>(null);

  const toggleNa = (drinkId: string) => {
    setNaSelections((prev) => ({ ...prev, [drinkId]: !prev[drinkId] }));
  };

  const spinGun = () => {
    if (isSpinning || hasActiveOrder) return;

    setIsSpinning(true);
    const targetIndex = Math.floor(Math.random() * drinks.length);

    // Gun barrel points RIGHT at 0 degrees. Drinks are positioned:
    // Index 0 = top (needs gun at 270° to point up)
    // Index 1 = top-right (needs gun at 315°)
    // Index 2 = right (needs gun at 0°)
    // etc., each drink is 45° apart
    const targetAngle = ((targetIndex * 45 - 90) % 360 + 360) % 360;

    // Calculate angle difference from current position to target
    const currentNormalized = ((gunRotation % 360) + 360) % 360;
    let angleToTarget = targetAngle - currentNormalized;
    if (angleToTarget <= 0) angleToTarget += 360; // Always spin clockwise at least a bit

    // Add 3-5 FULL spins (integer!) for visual effect
    const fullSpins = 3 + Math.floor(Math.random() * 3);
    const startRotation = gunRotation;
    const finalRotation = startRotation + fullSpins * 360 + angleToTarget;
    const totalDuration = 3000; // 3 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      // Ease out quart for smoother deceleration
      const eased = 1 - Math.pow(1 - progress, 4);

      const currentRotation = startRotation + (finalRotation - startRotation) * eased;

      // Update DOM directly for smooth animation
      if (gunRef.current) {
        gunRef.current.style.transform = `rotate(${currentRotation}deg)`;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Normalize to 0-360 range
        const normalizedRotation = ((finalRotation % 360) + 360) % 360;
        setGunRotation(normalizedRotation);
        setIsSpinning(false);
        // Open the modal for the selected drink
        setTimeout(() => {
          setSelectedDrink(drinks[targetIndex]);
        }, 500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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

      setComments((prev) => ({ ...prev, [drink.id]: "" }));
      setSelectedDrink(null);
      onOrderPlaced();
    } catch {
      setError("Failed to place order");
    } finally {
      setOrdering(null);
    }
  };

  // Calculate positions around the table
  const tableRadius = 140;
  const drinkPositions = drinks.map((_, index) => {
    const angle = (index * 45 - 90) * (Math.PI / 180); // Start from top, go clockwise
    return {
      x: Math.cos(angle) * tableRadius,
      y: Math.sin(angle) * tableRadius,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-4xl font-bold mb-6 text-center font-[family-name:var(--font-press-start)] text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 drop-shadow-lg">
        MENU
      </h2>

      {error && (
        <div className="bg-red-900/50 border-4 border-red-500 rounded-xl p-4 mb-6 text-red-200 text-center font-bold">
          {error}
        </div>
      )}

      {/* 8-bit Table */}
      <div className="relative" style={{ width: 400, height: 400 }}>
        {/* Table surface */}
        <div
          className="absolute rounded-full border-8 border-amber-900"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 340,
            height: 340,
            background: "radial-gradient(circle, #065f46 0%, #064e3b 50%, #022c22 100%)",
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* Table felt pattern */}
          <div
            className="absolute inset-4 rounded-full border-2 border-emerald-700/30"
          />
        </div>

        {/* Drinks around the table */}
        {drinks.map((drink, index) => {
          const pos = drinkPositions[index];
          // Gun at rotation R points at drink index = ((R + 90) / 45) % 8
          const pointingAtIndex = Math.round(((gunRotation + 90) % 360) / 45) % 8;
          const isHighlighted = !isSpinning && pointingAtIndex === index;

          return (
            <button
              key={drink.id}
              onClick={() => setSelectedDrink(drink)}
              className={`
                absolute transition-all duration-300 hover:scale-125 focus:outline-none
                ${isHighlighted ? "scale-125 z-10" : ""}
              `}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className={`
                relative p-2 rounded-lg transition-all
                ${isHighlighted ? "bg-yellow-400/30 ring-4 ring-yellow-400" : "hover:bg-white/10"}
              `}>
                <DrinkPixelArt drink={drink} size={56} />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white whitespace-nowrap font-[family-name:var(--font-press-start)] text-center" style={{ fontSize: "6px" }}>
                  {drink.emoji}
                </div>
              </div>
            </button>
          );
        })}

        {/* Revolver in center */}
        <button
          onClick={spinGun}
          disabled={isSpinning || hasActiveOrder}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            hover:scale-110 focus:outline-none
            ${isSpinning ? "cursor-wait" : "cursor-pointer"}
            disabled:opacity-50
          `}
        >
          <div
            ref={gunRef}
            style={{ transform: `rotate(${gunRotation}deg)` }}
          >
            <PixelRevolver />
          </div>
        </button>

        {/* Spin instruction */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-center">
          <p className="text-xs text-gray-400 font-[family-name:var(--font-press-start)]">
            {isSpinning ? "SPINNING..." : "SPIN THE REVOLVER"}
          </p>
        </div>
      </div>

      {/* Drink names legend */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {drinks.map((drink) => (
          <button
            key={drink.id}
            onClick={() => setSelectedDrink(drink)}
            className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-colors"
          >
            <span>{drink.emoji}</span>
            <span className="truncate">{drink.name}</span>
          </button>
        ))}
      </div>

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
