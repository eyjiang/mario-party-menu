"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Order } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StaffPage() {
  const [staffKey, setStaffKey] = useState<string>("");
  const [inputKey, setInputKey] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedKey = localStorage.getItem("staffKey");
    if (savedKey) {
      setStaffKey(savedKey);
      setIsLoggedIn(true);
    }
  }, []);

  const { data, mutate } = useSWR<{ orders: Order[] }>(
    isLoggedIn ? "/api/orders" : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const orders = data?.orders || [];

  const login = () => {
    const key = inputKey.trim();
    if (key) {
      localStorage.setItem("staffKey", key);
      setStaffKey(key);
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("staffKey");
    setStaffKey("");
    setIsLoggedIn(false);
    setInputKey("");
  };

  const completeOrder = async (orderId: string) => {
    setCompleting(orderId);
    setCompletedIds((prev) => new Set(prev).add(orderId));

    try {
      const res = await fetch(`/api/complete/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffKey }),
      });

      if (res.ok) {
        setTimeout(() => {
          mutate();
          setCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        }, 1000);
      } else if (res.status === 403) {
        logout();
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    } catch {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    } finally {
      setCompleting(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="menu-card p-8 max-w-sm w-full">
          <h1 className="text-4xl font-[family-name:var(--font-great-vibes)] text-gray-800 mb-2 text-center">
            Staff View
          </h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            Ambrosia &amp; Provisions
          </p>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Staff passphrase"
            autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300 mb-4"
          />
          <button
            onClick={login}
            className="w-full bg-[#5a6f8e] hover:bg-[#4d6180] text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-[family-name:var(--font-great-vibes)] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
              Orders
            </h1>
            {orders.length > 0 && (
              <p className="text-white/50 text-sm mt-0.5">
                {orders.length} pending
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-green-300/90 bg-green-900/25 px-2.5 py-1 rounded-full">
              Staff mode
            </span>
            <button
              onClick={logout}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Order list */}
        {orders.length === 0 ? (
          <div className="menu-card p-12 text-center">
            <p className="text-gray-400 text-lg font-medium">No pending orders</p>
            <p className="text-gray-300 text-sm mt-1">Checking every 3 seconds...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isCompleted = completedIds.has(order.id);
              return (
                <div
                  key={order.id}
                  className={`menu-card p-5 transition-all duration-500 ${
                    isCompleted ? "opacity-40 scale-[0.99]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`font-bold text-gray-900 text-lg leading-tight ${
                            isCompleted
                              ? "line-through decoration-red-400/60 decoration-2"
                              : ""
                          }`}
                        >
                          {order.drinkName}
                        </span>
                        <span className="text-gray-400 text-sm">for</span>
                        <span className="text-gray-600 font-medium text-sm">
                          {order.userName}
                        </span>
                      </div>
                      {order.comment && (
                        <p className="text-sm text-gray-500 mt-1.5 italic">
                          {order.comment}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => !isCompleted && completeOrder(order.id)}
                      disabled={completing === order.id || isCompleted}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isCompleted
                          ? "bg-green-100 text-green-600 cursor-default"
                          : "bg-green-500 hover:bg-green-600 active:scale-95 text-white shadow-sm"
                      } disabled:opacity-60`}
                    >
                      {isCompleted
                        ? "✓ Done"
                        : completing === order.id
                        ? "..."
                        : "Done"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-white/25 text-xs mt-10">
          Auto-refreshes every 3 seconds
        </p>
      </div>
    </div>
  );
}
