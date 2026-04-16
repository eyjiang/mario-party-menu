"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Order } from "@/lib/types";

interface OrderQueueProps {
  userId: string;
  onOrdersChange: (orders: Order[]) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderQueue({ userId, onOrdersChange }: OrderQueueProps) {
  const [staffKey, setStaffKey] = useState<string>("");
  const [showStaffInput, setShowStaffInput] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [canceling, setCanceling] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const { data, mutate } = useSWR<{ orders: Order[] }>("/api/orders", fetcher, {
    refreshInterval: 3000,
  });

  const orders = data?.orders || [];

  useEffect(() => {
    onOrdersChange(orders);
  }, [orders, onOrdersChange]);

  useEffect(() => {
    const savedKey = localStorage.getItem("staffKey");
    if (savedKey) {
      setStaffKey(savedKey);
      setIsStaff(true);
    }
  }, []);

  const enableStaffMode = () => {
    if (staffKey.trim()) {
      localStorage.setItem("staffKey", staffKey.trim());
      setIsStaff(true);
      setShowStaffInput(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setCanceling(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) mutate();
    } catch {
      console.error("Failed to cancel order");
    } finally {
      setCanceling(null);
    }
  };

  const completeOrder = async (orderId: string) => {
    setCompleting(orderId);
    // Mark as completed visually first (strikethrough)
    setCompletedIds((prev) => new Set(prev).add(orderId));

    try {
      const res = await fetch(`/api/complete/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffKey }),
      });
      if (res.ok) {
        // Remove from list after a short delay so the strikethrough is visible
        setTimeout(() => {
          mutate();
          setCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
          });
        }, 1200);
      } else if (res.status === 403) {
        localStorage.removeItem("staffKey");
        setIsStaff(false);
        setStaffKey("");
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    } catch {
      console.error("Failed to complete order");
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    } finally {
      setCompleting(null);
    }
  };

  if (orders.length === 0 && !isStaff) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-[family-name:var(--font-great-vibes)] text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]">
          Orders
        </h2>
        <div className="flex items-center gap-2">
          {!isStaff && !showStaffInput && (
            <button
              onClick={() => setShowStaffInput(true)}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Staff login
            </button>
          )}
          {isStaff && (
            <span className="text-xs text-green-300/80 bg-green-900/20 px-2 py-0.5 rounded">
              Staff mode
            </span>
          )}
        </div>
      </div>

      {showStaffInput && (
        <div className="menu-card p-3 mb-4 flex gap-2">
          <input
            type="password"
            value={staffKey}
            onChange={(e) => setStaffKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enableStaffMode()}
            placeholder="Staff passphrase"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-300"
          />
          <button
            onClick={enableStaffMode}
            className="bg-[#5a6f8e] hover:bg-[#4d6180] px-3 py-2 rounded-lg text-white text-sm font-semibold"
          >
            Go
          </button>
          <button
            onClick={() => setShowStaffInput(false)}
            className="text-gray-400 hover:text-gray-600 px-2"
          >
            &times;
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/40 text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isCompleted = completedIds.has(order.id);

            return (
              <div
                key={order.id}
                className={`order-card p-4 transition-all duration-300 ${isCompleted ? "completed" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={`font-bold text-gray-900 order-name ${isCompleted ? "line-through decoration-red-400/60 decoration-2" : ""}`}>
                        {order.drinkName}
                      </span>
                      <span className="text-sm text-gray-400">&mdash;</span>
                      <span className="text-sm text-gray-500">{order.userName}</span>
                    </div>
                    {order.comment && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        {order.comment}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {order.userId === userId && !isCompleted && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        disabled={canceling === order.id}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        {canceling === order.id ? "..." : "Cancel"}
                      </button>
                    )}
                    {isStaff && !isCompleted && (
                      <button
                        onClick={() => completeOrder(order.id)}
                        disabled={completing === order.id}
                        className="text-xs text-green-600 hover:text-green-700 transition-colors px-2 py-1 rounded hover:bg-green-50 font-semibold"
                      >
                        {completing === order.id ? "..." : "Done"}
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-xs text-green-500">&#10003;</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
