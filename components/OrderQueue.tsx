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
    try {
      const res = await fetch(`/api/complete/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffKey }),
      });
      if (res.ok) {
        mutate();
      } else if (res.status === 403) {
        localStorage.removeItem("staffKey");
        setIsStaff(false);
        setStaffKey("");
      }
    } catch {
      console.error("Failed to complete order");
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-press-start)] text-yellow-400 text-sm">
          📋 QUEUE
        </h2>
        {!isStaff && !showStaffInput && (
          <button
            onClick={() => setShowStaffInput(true)}
            className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
          >
            🔐 Staff
          </button>
        )}
        {isStaff && (
          <span className="text-xs text-green-400 font-bold bg-green-900/50 px-2 py-1 rounded">
            ✓ STAFF
          </span>
        )}
      </div>

      {showStaffInput && (
        <div className="flex gap-2 mb-5">
          <input
            type="password"
            value={staffKey}
            onChange={(e) => setStaffKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enableStaffMode()}
            placeholder="Passphrase"
            className="flex-1 bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
          <button
            onClick={enableStaffMode}
            className="bg-green-600 hover:bg-green-500 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            ✓
          </button>
          <button
            onClick={() => setShowStaffInput(false)}
            className="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-4 animate-bounce">🍹</div>
          <p className="text-gray-400 text-sm">No orders yet!</p>
          <p className="text-gray-500 text-xs mt-1">Be the first to order</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`
                relative overflow-hidden
                bg-gradient-to-r from-gray-700/50 to-gray-800/50
                rounded-xl p-4
                border border-gray-600/50
                ${order.userId === userId ? "ring-2 ring-yellow-500/50" : ""}
                transform transition-all hover:scale-[1.02]
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl font-bold text-yellow-500 font-[family-name:var(--font-press-start)] text-xs bg-yellow-500/20 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white">
                    {order.drinkName}
                    {order.isNonAlcoholic && (
                      <span className="ml-2 text-xs bg-blue-500/50 px-2 py-0.5 rounded-full">NA</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    for <span className="text-blue-400">{order.userName}</span>
                  </div>
                  {order.comment && (
                    <div className="mt-2 text-xs text-gray-300 bg-black/30 rounded-lg p-2 italic">
                      &ldquo;{order.comment}&rdquo;
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {order.userId === userId && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={canceling === order.id}
                    className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-50 border border-red-500/30"
                  >
                    {canceling === order.id ? "..." : "❌ Cancel"}
                  </button>
                )}
                {isStaff && (
                  <button
                    onClick={() => completeOrder(order.id)}
                    disabled={completing === order.id}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50 font-bold"
                  >
                    {completing === order.id ? "..." : "✓ DONE"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-700/50 text-center">
        <p className="text-sm text-gray-500">
          {orders.length} order{orders.length !== 1 ? "s" : ""} in queue
        </p>
      </div>
    </div>
  );
}
