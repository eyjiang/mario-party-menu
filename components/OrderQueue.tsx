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
  const [voting, setVoting] = useState<string | null>(null);

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

  const vote = async (orderId: string, voteType: "up" | "down") => {
    setVoting(orderId);
    try {
      const res = await fetch(`/api/vote/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: voteType }),
      });
      if (res.ok) {
        mutate();
      }
    } catch {
      console.error("Failed to vote");
    } finally {
      setVoting(null);
    }
  };

  return (
    <div className="hawaiian-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] gold-text">
          Order Queue
        </h2>
        {!isStaff && !showStaffInput && (
          <button
            onClick={() => setShowStaffInput(true)}
            className="text-xs text-amber-700/40 hover:text-amber-400 transition-colors font-[family-name:var(--font-cormorant)]"
          >
            Staff
          </button>
        )}
        {isStaff && (
          <span className="text-xs text-emerald-400 font-[family-name:var(--font-cormorant)] bg-emerald-900/30 px-2 py-1 rounded">
            Staff
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
            className="flex-1 bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 focus:outline-none focus:border-amber-600/50"
          />
          <button
            onClick={enableStaffMode}
            className="bg-emerald-800 hover:bg-emerald-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors text-emerald-50"
          >
            Go
          </button>
          <button
            onClick={() => setShowStaffInput(false)}
            className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors text-gray-300"
          >
            &times;
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-amber-700/40 text-sm font-[family-name:var(--font-cormorant)] italic">No orders yet</p>
          <p className="text-amber-800/30 text-xs mt-1 font-[family-name:var(--font-cormorant)]">Be the first to order</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`
                relative overflow-hidden
                bg-black/20 rounded-xl p-4
                border border-amber-900/20
                ${order.userId === userId ? "ring-1 ring-amber-600/30" : ""}
                transition-all hover:border-amber-700/30
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg font-bold text-amber-600/60 font-[family-name:var(--font-cormorant)] w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-900/20">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-[family-name:var(--font-playfair)] font-bold text-amber-100 text-sm">
                    {order.drinkName}
                    {order.isNonAlcoholic && (
                      <span className="ml-2 text-xs bg-amber-800/30 text-amber-300 px-2 py-0.5 rounded-full font-[family-name:var(--font-cormorant)]">Keiki</span>
                    )}
                  </div>
                  <div className="text-sm text-amber-700/50 font-[family-name:var(--font-cormorant)]">
                    for <span className="text-amber-400/70">{order.userName}</span>
                  </div>
                  {order.comment && (
                    <div className="mt-2 text-xs text-amber-200/60 bg-black/20 rounded-lg p-2 italic font-[family-name:var(--font-cormorant)]">
                      &ldquo;{order.comment}&rdquo;
                    </div>
                  )}
                </div>

                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => vote(order.id, "up")}
                    disabled={voting === order.id}
                    className="text-amber-500/60 hover:text-amber-300 p-1 rounded transition-all disabled:opacity-50 text-xs"
                  >
                    &#9650;
                  </button>
                  <span className="text-xs font-bold text-amber-200/70 font-[family-name:var(--font-cormorant)]">
                    {(order.upvotes || 0) - (order.downvotes || 0)}
                  </span>
                  <button
                    onClick={() => vote(order.id, "down")}
                    disabled={voting === order.id}
                    className="text-amber-500/60 hover:text-amber-300 p-1 rounded transition-all disabled:opacity-50 text-xs"
                  >
                    &#9660;
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                {order.userId === userId && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={canceling === order.id}
                    className="flex-1 text-red-400/70 hover:text-red-300 text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-50 border border-red-900/30 font-[family-name:var(--font-cormorant)]"
                  >
                    {canceling === order.id ? "..." : "Cancel"}
                  </button>
                )}
                {isStaff && (
                  <button
                    onClick={() => completeOrder(order.id)}
                    disabled={completing === order.id}
                    className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50 font-bold font-[family-name:var(--font-cormorant)] text-emerald-50"
                  >
                    {completing === order.id ? "..." : "Complete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-amber-900/20 text-center">
        <p className="text-sm text-amber-800/40 font-[family-name:var(--font-cormorant)]">
          {orders.length} order{orders.length !== 1 ? "s" : ""} in queue
        </p>
      </div>
    </div>
  );
}
