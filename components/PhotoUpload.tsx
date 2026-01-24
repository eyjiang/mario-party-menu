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
      <div className="bg-gradient-to-b from-pink-900/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-pink-500/50 shadow-lg shadow-pink-500/20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-press-start)] text-pink-400 text-sm">
            📸 PARTY PICS
          </h2>
          <label className="text-xs bg-pink-600 hover:bg-pink-500 px-3 py-1.5 rounded-lg transition-colors font-bold cursor-pointer">
            {uploading ? "..." : "📷 Upload"}
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
          <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {photos.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-400 text-sm">No photos yet</p>
            <p className="text-gray-500 text-xs mt-1">Upload a pic from the party!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-pink-500/30 hover:border-pink-500 transition-all cursor-pointer group"
              >
                <img
                  src={photo.dataUrl}
                  alt={`Photo by ${photo.userName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div>
                    <p className="text-white text-xs font-bold truncate">{photo.userName}</p>
                    <p className="text-gray-400 text-xs">{formatTime(photo.timestamp)}</p>
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
              className="absolute -top-10 right-0 text-white text-2xl hover:text-pink-400 transition-colors"
            >
              ✕
            </button>
            <img
              src={selectedPhoto.dataUrl}
              alt={`Photo by ${selectedPhoto.userName}`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl border-4 border-pink-500/50"
            />
            <div className="text-center mt-4">
              <p className="text-white font-bold">{selectedPhoto.userName}</p>
              <p className="text-gray-400 text-sm">{formatTime(selectedPhoto.timestamp)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
