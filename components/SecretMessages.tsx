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
    <div className="bg-gradient-to-b from-purple-900/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-press-start)] text-purple-400 text-sm">
          💌 SECRET MESSAGES
        </h2>
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg transition-colors font-bold"
        >
          {showCompose ? "✕ Cancel" : "✉️ New"}
        </button>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg text-green-400 text-sm">
          Message sent successfully!
        </div>
      )}

      {showCompose && (
        <div className="mb-5 p-4 bg-black/30 rounded-xl border border-purple-500/30">
          <div className="mb-3">
            <label className="text-xs text-gray-400 block mb-1">To:</label>
            <input
              type="text"
              value={toUserName}
              onChange={(e) => setToUserName(e.target.value)}
              placeholder="Recipient's name"
              className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="mb-3">
            <label className="text-xs text-gray-400 block mb-1">Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your secret message..."
              maxLength={500}
              rows={3}
              className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            />
            <div className="text-xs text-gray-500 text-right">{message.length}/500</div>
          </div>
          {error && (
            <div className="mb-3 text-red-400 text-xs">{error}</div>
          )}
          <button
            onClick={sendMessage}
            disabled={sending}
            className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Secret Message"}
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🤫</div>
          <p className="text-gray-400 text-sm">No secret messages yet</p>
          <p className="text-gray-500 text-xs mt-1">Messages sent to your name will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-gradient-to-r from-purple-800/30 to-gray-800/30 rounded-xl p-4 border border-purple-600/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-400 text-sm font-bold">
                  From: {msg.fromUserName}
                </span>
                <span className="text-gray-500 text-xs">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-white text-sm italic">&ldquo;{msg.message}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
