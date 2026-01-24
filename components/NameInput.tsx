"use client";

import { useState, useEffect } from "react";

export default function NameInput() {
  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load name from cookie on mount
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
      // Save name to cookie (7-day expiry)
      document.cookie = `userName=${encodeURIComponent(name.trim())}; path=/; max-age=${60 * 60 * 24 * 7}`;
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium mb-2">
          Enter your name to order:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            placeholder="Your name"
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            maxLength={30}
            autoFocus
          />
          <button
            onClick={saveName}
            disabled={!name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 flex items-center justify-between">
      <span>
        Ordering as: <strong className="text-blue-400">{name}</strong>
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Change
      </button>
    </div>
  );
}
