"use client";

import { useRef, useEffect, useState } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";

export function MediaPlayer() {
  const playback = useAppStore((state) => state.playback);
  const settings = useAppStore((state) => state.settings);
  const [fadeState, setFadeState] = useState<"in" | "out" | "visible">("in");
  const previousRound = useRef<"video" | "image">(playback.currentRound);

  useEffect(() => {
    // 動画⇔画像の切り替え時のみフェードイン
    // 画像→画像の切り替えではフェードしない
    if (previousRound.current !== playback.currentRound) {
      setFadeState("in");
      const fadeInTimer = setTimeout(() => {
        setFadeState("visible");
      }, settings.media.fadeInDuration * 1000);

      previousRound.current = playback.currentRound;
      return () => clearTimeout(fadeInTimer);
    } else {
      // 同じラウンド内での切り替え（画像→画像など）
      setFadeState("visible");
    }
  }, [playback.currentRound, playback.currentVideoId, playback.currentImages, settings.media.fadeInDuration]);

  const opacity = fadeState === "in" ? 0 : fadeState === "visible" ? 1 : 0;
  const transition = `opacity ${
    fadeState === "in"
      ? settings.media.fadeInDuration
      : settings.media.fadeOutDuration
  }s ease-in-out`;

  if (playback.currentRound === "video") {
    return (
      <div style={{ opacity, transition }} className="w-full h-full">
        <VideoPlayer />
      </div>
    );
  } else {
    return (
      <div style={{ opacity, transition }} className="w-full h-full">
        <ImageSlide />
      </div>
    );
  }
}

/**
 * 動画プレーヤー（画面いっぱいに表示）
 */
function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playback = useAppStore((state) => state.playback);
  const settings = useAppStore((state) => state.settings);
  const updatePlayback = useAppStore((state) => state.updatePlayback);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = settings.media.audioVolume / 100;

    if (playback.isPlaying) {
      video.play().catch(err => {
        console.error('Video play failed:', err);
      });
    } else {
      video.pause();
    }
  }, [playback.isPlaying, settings.media.audioVolume]);

  // 動画の長さを取得してstoreに保存
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        updatePlayback({ currentVideoDuration: video.duration });
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    // すでに読み込まれている場合
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [playback.currentVideoId, updatePlayback]);

  if (!playback.currentVideoId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📹</div>
          <div className="text-gray-600 text-lg">動画がアップロードされていません</div>
          <div className="text-gray-400 text-sm mt-2">メディアライブラリから動画を追加してください</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <video
        ref={videoRef}
        src={playback.currentVideoId}
        className="w-full h-full object-cover"
        loop={false}
        muted={!settings.media.audioEnabled}
        playsInline
        preload="auto"
      />
    </div>
  );
}

/**
 * 画像スライド（1枚または2枚を画面いっぱいに表示）
 */
function ImageSlide() {
  const playback = useAppStore((state) => state.playback);

  if (!playback.currentImages || playback.currentImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🖼️</div>
          <div className="text-gray-600 text-lg">画像がアップロードされていません</div>
          <div className="text-gray-400 text-sm mt-2">メディアライブラリから画像を追加してください</div>
        </div>
      </div>
    );
  }

  const imageCount = playback.currentImages.length;

  if (imageCount === 1) {
    // 1枚の場合は中央に画面いっぱいに表示
    return (
      <div className="w-full h-full flex items-center justify-center">
        <ImageItem
          key={playback.currentImages[0].item.id}
          src={playback.currentImages[0].item.src}
          index={0}
          total={1}
          isSingle={true}
        />
      </div>
    );
  } else {
    // 2枚の場合は左右に分割
    return (
      <div className="w-full h-full flex">
        {playback.currentImages.map((image, index) => (
          <ImageItem
            key={image.item.id}
            src={image.item.src}
            index={index}
            total={imageCount}
            isSingle={false}
          />
        ))}
      </div>
    );
  }
}

/**
 * 個別画像アイテム（上から下へのアニメーション、画面いっぱい）
 */
function ImageItem({
  src,
  index,
  total,
  isSingle,
}: {
  src: string;
  index: number;
  total: number;
  isSingle: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const settings = useAppStore((state) => state.settings);

  // アニメーション時間を設定から取得
  const animationDuration = settings.media.imageDuration / settings.media.animationSpeed;

  return (
    <div
      className={`${
        isSingle ? "w-full h-full" : "flex-1 h-full"
      } flex items-center justify-center transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            animation: `slideDown ${animationDuration}s linear forwards`,
          }}
        >
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            style={{
              transform: "scale(1.1)",
            }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(4%);
          }
        }
      `}</style>
    </div>
  );
}
