"use client";

import { useRef } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";

export function MediaLibrary({ onClose }: { onClose: () => void }) {
  const images = useAppStore((state) => state.images);
  const videos = useAppStore((state) => state.videos);
  const addImages = useAppStore((state) => state.addImages);
  const addVideos = useAppStore((state) => state.addVideos);
  const removeImage = useAppStore((state) => state.removeImage);
  const removeVideo = useAppStore((state) => state.removeVideo);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const src = await fileToDataUrl(file);
        return {
          id: crypto.randomUUID(),
          src,
          tags: [],
          displayCount: 0,
          weight: 1.0,
        };
      })
    );

    addImages(newImages);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newVideos = await Promise.all(
      Array.from(files).map(async (file) => {
        const src = await fileToDataUrl(file);
        return {
          id: crypto.randomUUID(),
          src,
        };
      })
    );

    addVideos(newVideos);
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm overflow-auto">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">メディアライブラリ</h1>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            閉じる
          </button>
        </div>

        {/* 画像セクション */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              画像 ({images.length})
            </h2>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              + 画像を追加
            </button>
          </div>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="grid grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square bg-white/10 rounded-lg overflow-hidden group"
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          {images.length === 0 && (
            <p className="text-white/50 text-center py-8">
              画像がありません。追加してください。
            </p>
          )}
        </section>

        {/* 動画セクション */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              動画 ({videos.length})
            </h2>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              + 動画を追加
            </button>
          </div>

          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleVideoUpload}
          />

          <div className="grid grid-cols-2 gap-4">
            {videos.map((vid) => (
              <div
                key={vid.id}
                className="relative aspect-video bg-white/10 rounded-lg overflow-hidden group"
              >
                <video src={vid.src} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeVideo(vid.id)}
                  className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  削除
                </button>
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                  {vid.label || `動画 ${vid.weekNumber || ""}`}
                </div>
              </div>
            ))}
          </div>

          {videos.length === 0 && (
            <p className="text-white/50 text-center py-8">
              動画がありません。追加してください。
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
