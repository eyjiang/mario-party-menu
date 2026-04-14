"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { SecretMessage } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SecretMessages() {
  const [toUserName, setToUserName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const { data, mutate } = useSWR<{ messages: SecretMessage[] }>(
    "/api/messages",
    fetcher,
    { refreshInterval: 5000 }
  );

  const messages = data?.messages || [];

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const sendMessage = async () => {
    if (!toUserName.trim() || !message.trim()) {
      setError("Please enter recipient name and message");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserName: toUserName.trim(), message: message.trim() }),
      });

      if (res.ok) {
        setToUserName("");
        setMessage("");
        setShowCompose(false);
        setSuccess(true);
        mutate();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="hawaiian-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] gold-text">
          Private Messages
        </h2>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="text-xs bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors font-[family-name:var(--font-cormorant)] text-amber-50"
        >
          {showCompose ? "Cancel" : "New"}
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-800/30 rounded-lg text-emerald-300 text-sm font-[family-name:var(--font-cormorant)]">
          Message sent!
        </div>
      )}

      {showCompose && (
        <div className="mb-5 p-4 bg-black/20 rounded-xl border border-amber-900/20">
          <div className="mb-3">
            <label className="text-xs text-amber-700/50 block mb-1 font-[family-name:var(--font-cormorant)]">To:</label>
            <input
              type="text"
              value={toUserName}
              onChange={(e) => setToUserName(e.target.value)}
              placeholder="Recipient's name"
              className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 focus:outline-none focus:border-amber-600/50 font-[family-name:var(--font-cormorant)]"
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-amber-700/50 block mb-1 font-[family-name:var(--font-cormorant)]">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              maxLength={500}
              rows={3}
              className="w-full bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 focus:outline-none focus:border-amber-600/50 resize-none font-[family-name:var(--font-cormorant)]"
            />
            <div className="text-xs text-amber-800/30 text-right font-[family-name:var(--font-cormorant)]">{message.length}/500</div>
          </div>
          {error && (
            <div className="mb-3 text-red-300 text-xs font-[family-name:var(--font-cormorant)]">{error}</div>
          )}
          <button
            onClick={sendMessage}
            disabled={sending}
            className="w-full bg-amber-800 hover:bg-amber-700 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 font-[family-name:var(--font-cormorant)] text-amber-50"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-amber-700/40 text-sm font-[family-name:var(--font-cormorant)] italic">No messages yet</p>
          <p className="text-amber-800/30 text-xs mt-1 font-[family-name:var(--font-cormorant)]">Messages sent to you will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-black/20 rounded-xl p-4 border border-amber-900/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400/70 text-sm font-bold font-[family-name:var(--font-cormorant)]">
                  From: {msg.fromUserName}
                </span>
                <span className="text-amber-800/30 text-xs font-[family-name:var(--font-cormorant)]">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-amber-100/80 text-sm italic font-[family-name:var(--font-cormorant)]">&ldquo;{msg.message}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
