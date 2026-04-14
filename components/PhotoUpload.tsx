"use client";

import { useState, useRef } from "react";
import useSWR from "swr";
import { Photo } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, mutate } = useSWR<{ photos: Photo[] }>(
    "/api/photos",
    fetcher,
    { refreshInterval: 5000 }
  );

  const photos = data?.photos || [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 500000) {
      setError("Image too large (max 500KB)");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;

        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });

        if (res.ok) {
          mutate();
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          const data = await res.json();
          setError(data.error || "Failed to upload photo");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read image");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Failed to upload photo");
      setUploading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="hawaiian-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)] gold-text">
            Photos
          </h2>
          <label className="text-xs bg-amber-800 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors font-[family-name:var(--font-cormorant)] cursor-pointer text-amber-50">
            {uploading ? "..." : "Upload"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg text-red-300 text-sm font-[family-name:var(--font-cormorant)]">
            {error}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-amber-700/40 text-sm font-[family-name:var(--font-cormorant)] italic">No photos yet</p>
            <p className="text-amber-800/30 text-xs mt-1 font-[family-name:var(--font-cormorant)]">Share a moment!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-xl overflow-hidden border border-amber-900/20 hover:border-amber-600/40 transition-all cursor-pointer group"
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo by ${photo.userName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div>
                    <p className="text-amber-50 text-xs font-bold truncate font-[family-name:var(--font-cormorant)]">{photo.userName}</p>
                    <p className="text-amber-300/60 text-xs font-[family-name:var(--font-cormorant)]">{formatTime(photo.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-amber-200 text-2xl hover:text-amber-50 transition-colors"
            >
              &times;
            </button>
            <img
              src={selectedPhoto.dataUrl}
              alt={`Photo by ${selectedPhoto.userName}`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-amber-900/30"
            />
            <div className="text-center mt-4">
              <p className="text-amber-100 font-bold font-[family-name:var(--font-cormorant)]">{selectedPhoto.userName}</p>
              <p className="text-amber-700/50 text-sm font-[family-name:var(--font-cormorant)]">{formatTime(selectedPhoto.timestamp)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
