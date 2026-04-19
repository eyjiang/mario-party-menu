"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { drinks } from "@/lib/drinks";

const MAX_FOOD = 2;

type ItemState = {
  selectedOptions: string[];
  optionNotes: Record<string, string>;
};

export default function OrderPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedDrink, setSelectedDrink] = useState<string>("");
  const [selectedFood, setSelectedFood] = useState<string[]>([]);
  const [itemState, setItemState] = useState<Record<string, ItemState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userId="));
    if (!existing) {
      const newId = uuidv4();
      document.cookie = `userId=${newId}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("edit");
    if (!id) return;

    setEditId(id);
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.order) return;
        const o = data.order as {
          userName: string;
          items: Array<{
            drinkId: string;
            selectedOptions?: string[];
            optionNotes?: Record<string, string>;
          }>;
        };
        setName(o.userName || "");
        const nextItemState: Record<string, ItemState> = {};
        const foodIds: string[] = [];
        let drinkId = "";
        for (const it of o.items) {
          nextItemState[it.drinkId] = {
            selectedOptions: it.selectedOptions || [],
            optionNotes: it.optionNotes || {},
          };
          const d = drinks.find((x) => x.id === it.drinkId);
          if (!d) continue;
          if (d.category === "drinks") drinkId = d.id;
          else foodIds.push(d.id);
        }
        setSelectedDrink(drinkId);
        setSelectedFood(foodIds);
        setItemState(nextItemState);
      })
      .catch(() => setError("Could not load your order."))
      .finally(() => setLoading(false));
  }, []);

  const food = drinks.filter((d) => d.category === "food");
  const bevs = drinks.filter((d) => d.category === "drinks");

  const ensureItem = (id: string): ItemState =>
    itemState[id] || { selectedOptions: [], optionNotes: {} };

  const toggleFood = (id: string) => {
    setSelectedFood((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_FOOD) return prev;
      return [...prev, id];
    });
  };

  const toggleOption = (drinkId: string, optId: string) => {
    setItemState((prev) => {
      const cur = prev[drinkId] || { selectedOptions: [], optionNotes: {} };
      const has = cur.selectedOptions.includes(optId);
      return {
        ...prev,
        [drinkId]: {
          ...cur,
          selectedOptions: has
            ? cur.selectedOptions.filter((o) => o !== optId)
            : [...cur.selectedOptions, optId],
        },
      };
    });
  };

  const setOptionNote = (drinkId: string, optId: string, value: string) => {
    setItemState((prev) => {
      const cur = prev[drinkId] || { selectedOptions: [], optionNotes: {} };
      return {
        ...prev,
        [drinkId]: {
          ...cur,
          optionNotes: { ...cur.optionNotes, [optId]: value },
        },
      };
    });
  };

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    const itemIds = [
      ...(selectedDrink ? [selectedDrink] : []),
      ...selectedFood,
    ];
    if (itemIds.length === 0) {
      setError("Please select at least one item.");
      return;
    }

    const items = itemIds.map((id) => {
      const state = ensureItem(id);
      const notes: Record<string, string> = {};
      for (const optId of state.selectedOptions) {
        const v = state.optionNotes[optId];
        if (v && v.trim()) notes[optId] = v.trim();
      }
      return {
        drinkId: id,
        selectedOptions: state.selectedOptions,
        ...(Object.keys(notes).length > 0 ? { optionNotes: notes } : {}),
      };
    });

    setSubmitting(true);
    try {
      const url = editId ? `/api/orders/${editId}` : "/api/orders";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: name.trim(), items }),
      });
      if (res.ok) {
        router.push(editId ? "/" : "/order/thanks");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save order.");
    } catch {
      setError("Failed to save order.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (drinkId: string) => {
    const drink = drinks.find((d) => d.id === drinkId);
    if (!drink || !drink.options || drink.options.length === 0) return null;
    const state = ensureItem(drinkId);

    return (
      <div className="mt-2 ml-7 space-y-2">
        {drink.options.map((opt) => {
          const checked = state.selectedOptions.includes(opt.id);
          const isVodkaReplace =
            drink.id === "espresso-martini" && opt.id === "replace-vodka";
          return (
            <div key={opt.id}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleOption(drinkId, opt.id)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#5a6f8e]"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
              {isVodkaReplace && checked && (
                <input
                  type="text"
                  value={state.optionNotes[opt.id] || ""}
                  onChange={(e) =>
                    setOptionNote(drinkId, opt.id, e.target.value.slice(0, 60))
                  }
                  placeholder="Replace with… (e.g. rum, tequila)"
                  className="mt-1.5 ml-6 w-[calc(100%-1.5rem)] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5a6f8e]"
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        <header className="text-center mb-6 pt-2">
          <h1 className="text-5xl md:text-7xl font-[family-name:var(--font-great-vibes)] text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.25)] leading-tight">
            {editId ? "Edit your order" : "Place your order"}
          </h1>
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white transition-colors underline underline-offset-2"
          >
            ← back to menu
          </Link>
        </header>

        {loading && (
          <div className="menu-card p-3 mb-4 text-sm text-gray-500 text-center">
            Loading your order…
          </div>
        )}

        <div className="menu-card p-4 mb-5 text-center">
          <p className="text-sm text-gray-700">
            Please only <strong>one order per person</strong>. You may choose{" "}
            <strong>one drink</strong> and <strong>up to two food items</strong>.
          </p>
        </div>

        {error && (
          <div className="menu-card p-3 mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="menu-card p-5 mb-5">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 50))}
            placeholder="Enter your name"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5a6f8e]"
            maxLength={50}
          />
        </div>

        {/* Food */}
        <div className="menu-card p-5 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Food</h2>
            <span className="text-xs text-gray-500">
              Pick up to 2 · {selectedFood.length}/{MAX_FOOD} selected
            </span>
          </div>
          <div className="space-y-3">
            {food.map((d) => {
              const checked = selectedFood.includes(d.id);
              const disabled = !checked && selectedFood.length >= MAX_FOOD;
              return (
                <div key={d.id}>
                  <label
                    className={`flex items-start gap-2.5 ${
                      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleFood(d.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 accent-[#5a6f8e]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {d.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.ingredients.join(", ")}
                      </div>
                    </div>
                  </label>
                  {checked && renderOptions(d.id)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Drinks */}
        <div className="menu-card p-5 mb-6">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Drinks</h2>
            <span className="text-xs text-gray-500">Pick one (or none)</span>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="drink"
                checked={selectedDrink === ""}
                onChange={() => setSelectedDrink("")}
                className="w-4 h-4 accent-[#5a6f8e]"
              />
              <span className="text-sm text-gray-500 italic">No drink</span>
            </label>
            {bevs.map((d) => {
              const checked = selectedDrink === d.id;
              return (
                <div key={d.id}>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="drink"
                      checked={checked}
                      onChange={() => setSelectedDrink(d.id)}
                      className="mt-1 w-4 h-4 accent-[#5a6f8e]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {d.name}
                        {d.isNonAlcoholic && (
                          <span className="ml-1.5 text-xs font-normal text-gray-500">
                            (Non-Alcoholic)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.ingredients.join(", ")}
                      </div>
                    </div>
                  </label>
                  {checked && renderOptions(d.id)}
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={submit}
          disabled={submitting || loading}
          className="w-full py-4 rounded-2xl bg-[#5a6f8e] hover:bg-[#4d6180] disabled:opacity-50 text-white text-lg font-semibold tracking-wide shadow-lg transition-all"
        >
          {submitting
            ? "Sending…"
            : editId
              ? "Save changes"
              : "Submit order"}
        </button>
      </div>
    </div>
  );
}
