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
    // Check for saved staff key
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
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        mutate();
      }
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
        // Invalid staff key
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
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Order Queue</h2>
        {!isStaff && !showStaffInput && (
          <button
            onClick={() => setShowStaffInput(true)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Staff Login
          </button>
        )}
        {isStaff && (
          <span className="text-sm text-green-400">Staff Mode</span>
        )}
      </div>

      {showStaffInput && (
        <div className="flex gap-2 mb-4">
          <input
            type="password"
            value={staffKey}
            onChange={(e) => setStaffKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enableStaffMode()}
            placeholder="Staff passphrase"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={enableStaffMode}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium transition-colors"
          >
            Unlock
          </button>
          <button
            onClick={() => setShowStaffInput(false)}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No pending orders</p>
      ) : (
        <div className="space-y-2">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-500">
                  #{index + 1}
                </span>
                <div>
                  <span className="font-medium">
                    {order.drinkName}
                    {order.isNonAlcoholic && (
                      <span className="text-blue-400 ml-1">(NA)</span>
                    )}
                  </span>
                  <span className="text-gray-400 ml-2">for {order.userName}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {order.userId === userId && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={canceling === order.id}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1 transition-colors disabled:opacity-50"
                  >
                    {canceling === order.id ? "..." : "Cancel"}
                  </button>
                )}
                {isStaff && (
                  <button
                    onClick={() => completeOrder(order.id)}
                    disabled={completing === order.id}
                    className="bg-green-600 hover:bg-green-700 text-sm px-3 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {completing === order.id ? "..." : "Complete"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
