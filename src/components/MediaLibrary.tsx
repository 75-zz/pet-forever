"use client";

import { useRef } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { exportAllImages, exportAllVideos, exportAllMedia, downloadImage, downloadVideo, autoRenameImages, autoRenameVideos, autoRenameAllMedia } from "@/lib/utils/mediaExport";

export function MediaLibrary({ onClose }: { onClose: () => void }) {
  const images = useAppStore((state) => state.images);
  const videos = useAppStore((state) => state.videos);
  const addImages = useAppStore((state) => state.addImages);
  const addVideos = useAppStore((state) => state.addVideos);
  const updateImages = useAppStore((state) => state.updateImages);
  const updateVideos = useAppStore((state) => state.updateVideos);
  const removeImage = useAppStore((state) => state.removeImage);
  const removeVideo = useAppStore((state) => state.removeVideo);
  const clearAllImages = useAppStore((state) => state.clearAllImages);
  const clearAllVideos = useAppStore((state) => state.clearAllVideos);
  const clearAllMedia = useAppStore((state) => state.clearAllMedia);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = await Promise.all(
      Array.from(files).map(async (file) => {
        const src = await fileToDataUrl(file);
        return {
          id: crypto.randomUUID(),
          src,
          fileName: file.name, // 元のファイル名を保存
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
          fileName: file.name, // 元のファイル名を保存
        };
      })
    );

    addVideos(newVideos);
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles: File[] = [];
    const videoFiles: File[] = [];

    // 画像と動画を分類
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        imageFiles.push(file);
      } else if (file.type.startsWith("video/")) {
        videoFiles.push(file);
      }
    });

    // 画像をアップロード
    if (imageFiles.length > 0) {
      const newImages = await Promise.all(
        imageFiles.map(async (file) => {
          const src = await fileToDataUrl(file);
          return {
            id: crypto.randomUUID(),
            src,
            fileName: file.name, // 元のファイル名を保存
            tags: [],
            displayCount: 0,
            weight: 1.0,
          };
        })
      );
      addImages(newImages);
    }

    // 動画をアップロード
    if (videoFiles.length > 0) {
      const newVideos = await Promise.all(
        videoFiles.map(async (file) => {
          const src = await fileToDataUrl(file);
          return {
            id: crypto.randomUUID(),
            src,
            fileName: file.name, // 元のファイル名を保存
          };
        })
      );
      addVideos(newVideos);
    }
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 自動リネーム処理
  const handleAutoRenameAll = () => {
    const { images: renamedImages, videos: renamedVideos } = autoRenameAllMedia(images, videos);
    updateImages(renamedImages);
    updateVideos(renamedVideos);
  };

  const handleAutoRenameImages = () => {
    const renamedImages = autoRenameImages(images);
    updateImages(renamedImages);
  };

  const handleAutoRenameVideos = () => {
    const renamedVideos = autoRenameVideos(videos);
    updateVideos(renamedVideos);
  };

  // 一括削除処理（確認ダイアログ付き）
  const handleClearAllMedia = () => {
    const totalCount = images.length + videos.length;
    if (totalCount === 0) return;

    if (window.confirm(`すべてのメディア（画像${images.length}件、動画${videos.length}件）を削除しますか？\nこの操作は取り消せません。`)) {
      clearAllMedia();
    }
  };

  const handleClearAllImages = () => {
    if (images.length === 0) return;

    if (window.confirm(`すべての画像（${images.length}件）を削除しますか？\nこの操作は取り消せません。`)) {
      clearAllImages();
    }
  };

  const handleClearAllVideos = () => {
    if (videos.length === 0) return;

    if (window.confirm(`すべての動画（${videos.length}件）を削除しますか？\nこの操作は取り消せません。`)) {
      clearAllVideos();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm overflow-auto">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">メディアライブラリ</h1>
            <button
              onClick={onClose}
              className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
          
          {/* エクスポート・インポートボタン */}
          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-2">📤 ダウンロード（端末に保存）</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => exportAllMedia(images, videos)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={images.length === 0 && videos.length === 0}
                >
                  <span>📥</span>
                  <span>すべてダウンロード</span>
                </button>
                <button
                  onClick={() => exportAllImages(images)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={images.length === 0}
                >
                  <span>🖼️</span>
                  <span>画像のみ</span>
                </button>
                <button
                  onClick={() => exportAllVideos(videos)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={videos.length === 0}
                >
                  <span>🎬</span>
                  <span>動画のみ</span>
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-2">📂 フォルダからインポート（端末から読み込み）</p>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>📁</span>
                <span>フォルダから追加</span>
              </button>
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFolderUpload}
              />
            </div>

            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-2">🏷️ ファイル名を自動リネーム</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={handleAutoRenameAll}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={images.length === 0 && videos.length === 0}
                >
                  <span>✏️</span>
                  <span>すべてリネーム</span>
                </button>
                <button
                  onClick={handleAutoRenameImages}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={images.length === 0}
                >
                  <span>🖼️</span>
                  <span>画像のみ</span>
                </button>
                <button
                  onClick={handleAutoRenameVideos}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={videos.length === 0}
                >
                  <span>🎬</span>
                  <span>動画のみ</span>
                </button>
              </div>
              <p className="text-white/50 text-xs mt-2">
                ファイル名を image_1.jpg, video_1.mp4 のように統一します
              </p>
            </div>

            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-2">🗑️ 一括削除</p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={handleClearAllMedia}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={images.length === 0 && videos.length === 0}
                >
                  <span>🗑️</span>
                  <span>すべて削除</span>
                </button>
                <button
                  onClick={handleClearAllImages}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={images.length === 0}
                >
                  <span>🖼️</span>
                  <span>画像のみ</span>
                </button>
                <button
                  onClick={handleClearAllVideos}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={videos.length === 0}
                >
                  <span>🎬</span>
                  <span>動画のみ</span>
                </button>
              </div>
              <p className="text-white/50 text-xs mt-2">
                ⚠️ 削除したメディアは復元できません。慎重に操作してください。
              </p>
            </div>
          </div>
        </div>

        {/* 画像セクション */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              画像 ({images.length})
            </h2>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="relative aspect-square bg-white/10 rounded-lg overflow-hidden group"
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadImage(img, index)}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm bg-green-500 hover:bg-green-600 text-white rounded"
                    title="ダウンロード"
                  >
                    📥
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
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
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              動画 ({videos.length})
            </h2>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {videos.map((vid, index) => (
              <div
                key={vid.id}
                className="relative aspect-video bg-white/10 rounded-lg overflow-hidden group"
              >
                <video src={vid.src} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => downloadVideo(vid, index)}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm bg-green-500 hover:bg-green-600 text-white rounded"
                    title="ダウンロード"
                  >
                    📥
                  </button>
                  <button
                    onClick={() => removeVideo(vid.id)}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-1 sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                    title="削除"
                  >
                    🗑️
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 text-white text-xs sm:text-sm bg-black/50 px-2 py-1 rounded">
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
