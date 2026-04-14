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
      <div className="hawaiian-card rounded-2xl p-4 mb-8">
        <span className="text-amber-700/50 animate-pulse font-[family-name:var(--font-cormorant)]">Loading...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="hawaiian-card rounded-2xl p-6 mb-8">
        <label className="block text-lg font-[family-name:var(--font-cormorant)] font-semibold mb-3 text-amber-200 tracking-wide">
          Enter Your Name
        </label>
        {error && (
          <div className="mb-3 text-red-300 text-sm bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 font-[family-name:var(--font-cormorant)]">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            placeholder="Your name"
            className="flex-1 bg-black/30 border border-amber-900/30 rounded-xl px-4 py-3 text-amber-50 text-lg placeholder-amber-800/40 focus:outline-none focus:border-amber-600/50 transition-all font-[family-name:var(--font-cormorant)]"
            maxLength={30}
            autoFocus
          />
          <button
            onClick={saveName}
            disabled={!name.trim() || loading}
            className="bg-amber-800 hover:bg-amber-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-[family-name:var(--font-cormorant)] font-bold text-lg tracking-wider transition-all text-amber-50"
          >
            {loading ? "..." : "Enter"}
          </button>
        </div>
        <p className="mt-2 text-xs text-amber-800/40 font-[family-name:var(--font-cormorant)]">
          Names are unique &mdash; pick one that&apos;s not taken
        </p>
      </div>
    );
  }

  return (
    <div className="hawaiian-card rounded-2xl p-4 mb-8 flex items-center justify-between">
      <span className="text-lg font-[family-name:var(--font-cormorant)] tracking-wide text-amber-200/80">
        Welcome, <strong className="text-amber-100 text-xl">{savedName}</strong>
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-amber-600/60 hover:text-amber-300 transition-colors font-[family-name:var(--font-cormorant)] bg-black/20 px-3 py-1 rounded-lg hover:bg-black/30"
      >
        Change
      </button>
    </div>
  );
}
