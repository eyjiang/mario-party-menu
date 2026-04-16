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
      <div className="mb-4">
        <span className="text-white/40 animate-pulse text-sm">Loading...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="menu-card p-5 mb-6 max-w-md mx-auto">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          What&apos;s your name?
        </label>
        {error && (
          <div className="mb-2 text-red-500 text-sm">{error}</div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            placeholder="Enter your name"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-300 text-sm"
            maxLength={30}
            autoFocus
          />
          <button
            onClick={saveName}
            disabled={!name.trim() || loading}
            className="bg-[#5a6f8e] hover:bg-[#4d6180] disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
          >
            {loading ? "..." : "Go"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <span className="text-white/70 text-sm drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
        Ordering as <strong className="text-white">{savedName}</strong>
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
      >
        change
      </button>
    </div>
  );
}
