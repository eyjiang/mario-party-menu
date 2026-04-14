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
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-xl font-[family-name:var(--font-playfair)] font-semibold gold-text">
          Your Order
        </h2>
        {!isStaff && !showStaffInput && (
          <button
            onClick={() => setShowStaffInput(true)}
            className="text-[10px] text-amber-800/25 hover:text-amber-600/40 transition-colors font-[family-name:var(--font-cormorant)] tracking-wider uppercase"
          >
            Staff
          </button>
        )}
        {isStaff && (
          <span className="text-[10px] text-emerald-600/50 font-[family-name:var(--font-cormorant)] tracking-wider uppercase">
            Staff Mode
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
            className="flex-1 bg-transparent border-b border-amber-900/20 px-1 py-2 text-sm text-amber-50/70 placeholder-amber-800/25 focus:outline-none focus:border-amber-700/40 font-[family-name:var(--font-cormorant)]"
          />
          <button onClick={enableStaffMode} className="text-amber-500/50 hover:text-amber-400 text-xs font-[family-name:var(--font-cormorant)] uppercase tracking-wider">Go</button>
          <button onClick={() => setShowStaffInput(false)} className="text-amber-800/30 hover:text-amber-500/50 text-sm">&times;</button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-amber-800/25 text-sm font-[family-name:var(--font-cormorant)] italic">
            No orders yet
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`
                py-4 border-b border-amber-900/10 last:border-0
                ${order.userId === userId ? "pl-3 border-l border-l-amber-700/20" : ""}
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xs text-amber-700/30 font-[family-name:var(--font-cormorant)] mt-1 w-5 flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-[family-name:var(--font-playfair)] text-amber-100/80 text-sm">
                    {order.drinkName}
                    {order.isNonAlcoholic && (
                      <span className="ml-2 text-[10px] text-amber-500/40 font-[family-name:var(--font-cormorant)] uppercase tracking-wider">Keiki</span>
                    )}
                  </div>
                  <div className="text-xs text-amber-700/30 font-[family-name:var(--font-cormorant)] mt-0.5">
                    {order.userName}
                  </div>
                  {order.comment && (
                    <div className="mt-1.5 text-xs text-amber-400/30 italic font-[family-name:var(--font-cormorant)]">
                      &ldquo;{order.comment}&rdquo;
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => vote(order.id, "up")}
                    disabled={voting === order.id}
                    className="text-amber-700/25 hover:text-amber-400/60 p-0.5 transition-all disabled:opacity-50 text-[10px]"
                  >
                    &#9650;
                  </button>
                  <span className="text-[10px] text-amber-500/40 font-[family-name:var(--font-cormorant)]">
                    {(order.upvotes || 0) - (order.downvotes || 0)}
                  </span>
                  <button
                    onClick={() => vote(order.id, "down")}
                    disabled={voting === order.id}
                    className="text-amber-700/25 hover:text-amber-400/60 p-0.5 transition-all disabled:opacity-50 text-[10px]"
                  >
                    &#9660;
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-2 ml-8">
                {order.userId === userId && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={canceling === order.id}
                    className="text-red-500/30 hover:text-red-400/50 text-[10px] font-[family-name:var(--font-cormorant)] uppercase tracking-wider transition-colors"
                  >
                    {canceling === order.id ? "..." : "Cancel"}
                  </button>
                )}
                {isStaff && (
                  <button
                    onClick={() => completeOrder(order.id)}
                    disabled={completing === order.id}
                    className="text-emerald-500/40 hover:text-emerald-400/60 text-[10px] font-[family-name:var(--font-cormorant)] uppercase tracking-wider transition-colors"
                  >
                    {completing === order.id ? "..." : "Complete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-amber-900/10">
        <p className="text-[10px] text-amber-800/20 font-[family-name:var(--font-cormorant)] tracking-wider uppercase">
          {orders.length} order{orders.length !== 1 ? "s" : ""} in queue
        </p>
      </div>
    </div>
  );
}
