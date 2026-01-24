"use client";

import { useState, useEffect } from "react";

export default function NameInput() {
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the registered name from the server
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
      <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-8 border-2 border-gray-500/50">
        <span className="text-gray-400 animate-pulse">Loading...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
        <label className="block text-lg font-bold mb-3 font-[family-name:var(--font-bangers)] tracking-wide text-purple-300">
          🎮 ENTER YOUR PLAYER NAME:
        </label>
        {error && (
          <div className="mb-3 text-red-400 text-sm bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            placeholder="Player 1"
            className="flex-1 bg-black/50 border-2 border-purple-400 rounded-xl px-4 py-3 text-white text-lg placeholder-purple-300/50 focus:outline-none focus:border-yellow-400 focus:shadow-lg focus:shadow-yellow-400/30 transition-all"
            maxLength={30}
            autoFocus
          />
          <button
            onClick={saveName}
            disabled={!name.trim() || loading}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50"
          >
            {loading ? "..." : "✓ START!"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Names are unique - pick one that&apos;s not taken!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-4 mb-8 border-2 border-green-500/50 shadow-lg shadow-green-500/20 flex items-center justify-between">
      <span className="text-lg font-[family-name:var(--font-bangers)] tracking-wide">
        🕹️ PLAYER: <strong className="text-green-400 text-xl">{savedName}</strong>
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-green-400 hover:text-yellow-400 transition-colors font-bold bg-black/30 px-3 py-1 rounded-lg hover:bg-black/50"
      >
        ✏️ CHANGE
      </button>
    </div>
  );
}
