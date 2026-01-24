"use client";

import { useState, useEffect } from "react";

export default function NameInput() {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedName = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userName="))
      ?.split("=")[1];
    if (savedName) {
      setName(decodeURIComponent(savedName));
    } else {
      setIsEditing(true);
    }
  }, []);

  const saveName = () => {
    if (name.trim()) {
      document.cookie = `userName=${encodeURIComponent(name.trim())}; path=/; max-age=${60 * 60 * 24 * 7}`;
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20">
        <label className="block text-lg font-bold mb-3 font-[family-name:var(--font-bangers)] tracking-wide text-purple-300">
          🎮 ENTER YOUR PLAYER NAME:
        </label>
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
            disabled={!name.trim()}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-500/50"
          >
            ✓ START!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 backdrop-blur-sm rounded-2xl p-4 mb-8 border-2 border-green-500/50 shadow-lg shadow-green-500/20 flex items-center justify-between">
      <span className="text-lg font-[family-name:var(--font-bangers)] tracking-wide">
        🕹️ PLAYER: <strong className="text-green-400 text-xl">{name}</strong>
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
