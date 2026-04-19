"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Order, OrderItem } from "@/lib/types";
import { getDrinkById } from "@/lib/drinks";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type OrderComment = {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
};

function optionLabel(drinkId: string, optionId: string): string {
  return (
    getDrinkById(drinkId)?.options?.find((o) => o.id === optionId)?.label ||
    optionId
  );
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

function Comments({
  orderId,
  defaultName,
  onNameChange,
}: {
  orderId: string;
  defaultName: string;
  onNameChange: (name: string) => void;
}) {
  const { data, mutate } = useSWR<{ comments: OrderComment[] }>(
    `/api/orders/${orderId}/comments`,
    fetcher,
    { refreshInterval: 5000 }
  );
  const [text, setText] = useState("");
  const [name, setName] = useState(defaultName);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  const comments = data?.comments || [];

  const submit = async () => {
    setError(null);
    if (!name.trim() || !text.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: name.trim(), text: text.trim() }),
      });
      if (res.ok) {
        setText("");
        onNameChange(name.trim());
        mutate();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to post.");
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200/70">
      {comments.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {comments.map((c) => (
            <div key={c.id} className="text-xs text-gray-600 leading-snug">
              <span className="font-semibold text-gray-800">{c.userName}</span>
              <span className="text-gray-400"> · </span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 mb-1">{error}</div>
      )}
      <div className="flex gap-1.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 40))}
          placeholder="name"
          className="w-20 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5a6f8e]"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="add a comment…"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5a6f8e]"
        />
        <button
          onClick={submit}
          disabled={posting || !text.trim() || !name.trim()}
          className="text-xs px-2 py-1 rounded-md bg-[#5a6f8e] hover:bg-[#4d6180] disabled:opacity-40 text-white font-semibold"
        >
          {posting ? "…" : "Post"}
        </button>
      </div>
    </div>
  );
}

export default function OrderQueue({ userId }: { userId: string }) {
  const [staffKey, setStaffKey] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [showStaffInput, setShowStaffInput] = useState(false);
  const [staffInput, setStaffInput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [commenterName, setCommenterName] = useState("");

  const { data, mutate } = useSWR<{ orders: Order[] }>("/api/orders", fetcher, {
    refreshInterval: 3000,
  });

  useEffect(() => {
    const saved = localStorage.getItem("staffKey");
    if (saved) {
      setStaffKey(saved);
      setIsStaff(true);
    }
    const savedName = localStorage.getItem("commenterName");
    if (savedName) setCommenterName(savedName);
  }, []);

  const updateCommenterName = (n: string) => {
    setCommenterName(n);
    localStorage.setItem("commenterName", n);
  };

  const enableStaff = () => {
    if (!staffInput.trim()) return;
    localStorage.setItem("staffKey", staffInput.trim());
    setStaffKey(staffInput.trim());
    setIsStaff(true);
    setShowStaffInput(false);
    setStaffInput("");
  };

  const disableStaff = () => {
    localStorage.removeItem("staffKey");
    setStaffKey("");
    setIsStaff(false);
  };

  const removeOrder = async (orderId: string) => {
    setBusy(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) mutate();
    } finally {
      setBusy(null);
    }
  };

  const completeOrder = async (orderId: string) => {
    setBusy(orderId);
    try {
      const res = await fetch(`/api/complete/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffKey }),
      });
      if (res.ok) {
        mutate();
      } else if (res.status === 403) {
        disableStaff();
      }
    } finally {
      setBusy(null);
    }
  };

  const orders = (data?.orders || []).slice().sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return a.timestamp - b.timestamp;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-great-vibes)] text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
          Orders
        </h2>
        <div className="flex items-center gap-2">
          {!isStaff && !showStaffInput && (
            <button
              onClick={() => setShowStaffInput(true)}
              className="text-xs text-white/40 hover:text-white/80 transition-colors"
            >
              Staff login
            </button>
          )}
          {isStaff && (
            <>
              <span className="text-xs text-green-300/90 bg-green-900/25 px-2 py-0.5 rounded">
                Staff mode
              </span>
              <button
                onClick={disableStaff}
                className="text-xs text-white/40 hover:text-white/80"
              >
                exit
              </button>
            </>
          )}
        </div>
      </div>

      {showStaffInput && (
        <div className="menu-card p-3 mb-4 flex gap-2">
          <input
            type="password"
            value={staffInput}
            onChange={(e) => setStaffInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enableStaff()}
            placeholder="Staff passphrase"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-[#5a6f8e]"
            autoFocus
          />
          <button
            onClick={enableStaff}
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
          <p className="text-white/50 text-sm">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isComplete = order.status === "complete";
            const isMine = order.userId === userId;
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
                          {new Date(order.completedAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {isStaff && !isComplete && (
                      <button
                        onClick={() => completeOrder(order.id)}
                        disabled={busy === order.id}
                        className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {busy === order.id ? "…" : "Mark done"}
                      </button>
                    )}
                    {isMine && !isComplete && (
                      <Link
                        href={`/order?edit=${order.id}`}
                        className="text-xs font-semibold text-[#5a6f8e] hover:text-[#3e5574] px-2 py-1 rounded transition-colors text-center"
                      >
                        Edit
                      </Link>
                    )}
                    {isMine && (
                      <button
                        onClick={() => removeOrder(order.id)}
                        disabled={busy === order.id}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 px-2 py-1 rounded transition-colors"
                      >
                        {busy === order.id ? "…" : "Remove"}
                      </button>
                    )}
                  </div>
                </div>

                <Comments
                  orderId={order.id}
                  defaultName={commenterName}
                  onNameChange={updateCommenterName}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
