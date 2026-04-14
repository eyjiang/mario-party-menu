"use client";

import { useState, useEffect } from "react";

export default function NameInput() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/name")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) {
          setSavedName(data.name);
          setName(data.name);
        } else {
          setIsEditing(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setIsEditing(true);
      });
  }, []);

  const saveName = async () => {
    if (!name.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setSavedName(data.name);
        setIsEditing(false);
      } else {
        setError(data.error || "Failed to set name");
      }
    } catch {
      setError("Failed to set name");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="mb-6 py-3">
        <span className="text-amber-800/30 animate-pulse font-[family-name:var(--font-cormorant)] text-sm">Loading...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mb-8 border-b border-amber-900/15 pb-8">
        <label className="block text-sm font-[family-name:var(--font-cormorant)] font-light mb-3 text-amber-500/50 tracking-wide uppercase">
          Your Name
        </label>
        {error && (
          <div className="mb-3 text-red-400/60 text-sm font-[family-name:var(--font-cormorant)]">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            placeholder="Enter your name"
            className="flex-1 bg-transparent border-b border-amber-800/20 px-1 py-2 text-amber-100/80 text-lg placeholder-amber-800/20 focus:outline-none focus:border-amber-600/40 transition-colors font-[family-name:var(--font-cormorant)]"
            maxLength={30}
            autoFocus
          />
          <button
            onClick={saveName}
            disabled={!name.trim() || loading}
            className="text-amber-500/50 hover:text-amber-400/70 disabled:text-amber-900/20 disabled:cursor-not-allowed font-[family-name:var(--font-cormorant)] text-sm tracking-widest uppercase transition-colors px-2"
          >
            {loading ? "..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 flex items-baseline justify-between border-b border-amber-900/10 pb-6">
      <span className="font-[family-name:var(--font-cormorant)] text-amber-600/40 text-sm tracking-wide">
        Welcome, <span className="text-amber-200/70 text-base">{savedName}</span>
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-amber-700/25 hover:text-amber-500/50 transition-colors font-[family-name:var(--font-cormorant)] tracking-wider uppercase"
      >
        Change
      </button>
    </div>
  );
}
