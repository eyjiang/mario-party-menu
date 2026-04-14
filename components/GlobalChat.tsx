"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";

interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GlobalChat() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useSWR<{ messages: ChatMessage[] }>(
    "/api/chat",
    fetcher,
    { refreshInterval: 2000 }
  );

  const messages = data?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.ok) {
        setMessage("");
        mutate();
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="hawaiian-card rounded-2xl p-6">
      <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] gold-text mb-5">
        Talk Story
      </h2>

      <div className="bg-black/20 rounded-xl p-3 mb-4 h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-amber-800/40 text-sm font-[family-name:var(--font-cormorant)] italic">No messages yet. Say aloha!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm font-[family-name:var(--font-cormorant)]">
                <span className="text-amber-800/40 text-xs mr-2">
                  {formatTime(msg.timestamp)}
                </span>
                <span className="text-amber-400/80 font-bold">{msg.userName}:</span>{" "}
                <span className="text-amber-100/80">{msg.message}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          maxLength={300}
          className="flex-1 bg-black/30 border border-amber-900/30 rounded-lg px-3 py-2 text-sm text-amber-50 placeholder-amber-800/40 focus:outline-none focus:border-amber-600/50 font-[family-name:var(--font-cormorant)]"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !message.trim()}
          className="bg-amber-800 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 font-[family-name:var(--font-cormorant)] text-amber-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
