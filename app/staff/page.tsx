"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Order, OrderItem } from "@/lib/types";
import { getDrinkById } from "@/lib/drinks";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function optionLabel(drinkId: string, optionId: string): string {
  const opt = getDrinkById(drinkId)?.options?.find((o) => o.id === optionId);
  return opt?.label || optionId;
}

function ItemLine({ item }: { item: OrderItem }) {
  const mods: string[] = [];
  for (const optId of item.selectedOptions) {
    const label = optionLabel(item.drinkId, optId);
    const note = item.optionNotes?.[optId];
    mods.push(note ? `${label}: ${note}` : label);
  }
  return (
    <div className="text-sm">
      <span className="font-semibold text-gray-900">{item.drinkName}</span>
      {mods.length > 0 && (
        <span className="text-gray-600"> — {mods.join(", ")}</span>
      )}
    </div>
  );
}

export default function StaffPage() {
  const [staffKey, setStaffKey] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [input, setInput] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const { data, mutate } = useSWR<{ orders: Order[] }>(
    isStaff ? "/api/orders" : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  useEffect(() => {
    const saved = localStorage.getItem("staffKey");
    if (saved) {
      setStaffKey(saved);
      setIsStaff(true);
    }
  }, []);

  const login = () => {
    if (!input.trim()) return;
    localStorage.setItem("staffKey", input.trim());
    setStaffKey(input.trim());
    setIsStaff(true);
    setInput("");
    setAuthError(null);
  };

  const logout = () => {
    localStorage.removeItem("staffKey");
    setStaffKey("");
    setIsStaff(false);
  };

  const complete = async (orderId: string) => {
    setCompleting(orderId);
    try {
      const res = await fetch(`/api/complete/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffKey }),
      });
      if (res.ok) {
        mutate();
      } else if (res.status === 403) {
        setAuthError("Invalid staff key.");
        logout();
      }
    } catch {
      // ignore
    } finally {
      setCompleting(null);
    }
  };

  const orders = (data?.orders || []).slice().sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return a.timestamp - b.timestamp;
  });

  return (
    <div className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-great-vibes)] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            Staff · Orders
          </h1>
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white underline underline-offset-2"
          >
            ← menu
          </Link>
        </header>

        {!isStaff ? (
          <div className="menu-card p-5 max-w-md mx-auto">
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Staff passphrase
            </label>
            {authError && (
              <div className="text-red-500 text-sm mb-2">{authError}</div>
            )}
            <div className="flex gap-2">
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && login()}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#5a6f8e]"
                autoFocus
              />
              <button
                onClick={login}
                className="bg-[#5a6f8e] hover:bg-[#4d6180] px-4 py-2 rounded-lg text-white text-sm font-semibold"
              >
                Enter
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-green-300/90 bg-green-900/20 px-2 py-0.5 rounded">
                Staff mode
              </span>
              <button
                onClick={logout}
                className="text-xs text-white/50 hover:text-white underline underline-offset-2"
              >
                sign out
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-white/60 text-sm">
                No orders yet.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isComplete = order.status === "complete";
                  const drink = order.items.find((i) => i.category === "drinks");
                  const food = order.items.filter((i) => i.category === "food");

                  return (
                    <div
                      key={order.id}
                      className={`order-card p-4 ${isComplete ? "completed" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div
                            className={`order-name font-bold text-gray-900 text-base mb-2 ${
                              isComplete ? "line-through" : ""
                            }`}
                          >
                            {order.userName}
                          </div>

                          {drink && (
                            <div className="mb-1">
                              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                                Drink
                              </div>
                              <ItemLine item={drink} />
                            </div>
                          )}

                          {food.length > 0 && (
                            <div className="mt-2">
                              <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                                Food
                              </div>
                              <div className="space-y-0.5">
                                {food.map((f) => (
                                  <ItemLine key={f.drinkId} item={f} />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="text-[11px] text-gray-400 mt-2">
                            {new Date(order.timestamp).toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                            {isComplete && order.completedAt && (
                              <>
                                {" · done "}
                                {new Date(order.completedAt).toLocaleTimeString(
                                  [],
                                  { hour: "numeric", minute: "2-digit" }
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {!isComplete ? (
                            <button
                              onClick={() => complete(order.id)}
                              disabled={completing === order.id}
                              className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {completing === order.id ? "…" : "Mark done"}
                            </button>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold">
                              ✓ done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
