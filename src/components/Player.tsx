"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { Calendar } from "./Calendar";
import { MediaPlayer } from "./MediaPlayer";
import { MediaLibrary } from "./MediaLibrary";
import { Settings } from "./Settings";
import { CalendarService } from "@/lib/services/CalendarService";
import { WeeklyVideoScheduler } from "@/lib/services/WeeklyVideoScheduler";
import { DiversityPicker } from "@/lib/services/DiversityPicker";
import { RoundConductor } from "@/lib/services/RoundConductor";

export function Player() {
  const settings = useAppStore((state) => state.settings);
  const images = useAppStore((state) => state.images);
  const videos = useAppStore((state) => state.videos);
  const weeklySchedule = useAppStore((state) => state.weeklySchedule);
  const playback = useAppStore((state) => state.playback);
  const updatePlayback = useAppStore((state) => state.updatePlayback);

  const [showSettings, setShowSettings] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // サービスインスタンスを作成
  const calendarService = useMemo(
    () => new CalendarService(settings.locale, settings.calendar.weekStart),
    [settings.locale, settings.calendar.weekStart]
  );

  const videoScheduler = useMemo(
    () => new WeeklyVideoScheduler(calendarService, weeklySchedule, videos),
    [calendarService, weeklySchedule, videos]
  );

  const diversityPicker = useMemo(
    () => new DiversityPicker(settings.diversity),
    [settings.diversity]
  );

  const roundConductor = useMemo(
    () => new RoundConductor(settings.media, diversityPicker),
    [settings.media, diversityPicker]
  );

  const videoTimeoutRef = useRef<NodeJS.Timeout>();
  const imageTimeoutRef = useRef<NodeJS.Timeout>();

  // 初期化: 現在の週の動画を取得
  useEffect(() => {
    const currentVideo = videoScheduler.getCurrentVideo();
    if (currentVideo) {
      updatePlayback({
        currentVideoId: currentVideo.src,
        currentRound: "video",
      });
    } else if (images.length > 0) {
      // 動画がない場合は画像から始める
      const nextRound = roundConductor.nextRound(images);
      if (nextRound.round === "image" && nextRound.images) {
        updatePlayback({
          currentRound: "image",
          currentImages: nextRound.images,
        });
      }
    }
  }, [videoScheduler, updatePlayback, images, roundConductor, videos]);

  // 再生ロジック
  useEffect(() => {
    if (!playback.isPlaying) return;

    if (playback.currentRound === "video") {
      // fixed が設定されている場合はそれを使用、なければ実際の動画の長さ、なければデフォルト15秒
      const videoSeconds = settings.media.videoSeconds.fixed
        || playback.currentVideoDuration
        || 15;

      videoTimeoutRef.current = setTimeout(() => {
        // 次のラウンド（画像）へ
        const nextRound = roundConductor.nextRound(images);

        if (nextRound.round === "image" && nextRound.images) {
          updatePlayback({
            currentRound: "image",
            currentImages: nextRound.images,
          });
        }
      }, videoSeconds * 1000);
    } else if (playback.currentRound === "image") {
      // 画像表示時間
      imageTimeoutRef.current = setTimeout(() => {
        // 次のラウンド（動画）へ
        const nextRound = roundConductor.nextRound(images);

        if (nextRound.round === "video") {
          const currentVideo = videoScheduler.getCurrentVideo();
          if (currentVideo) {
            updatePlayback({
              currentRound: "video",
              currentVideoId: currentVideo.src,
            });
          } else {
            // 動画がない場合は、画像を続ける
            const imageRound = roundConductor.nextRound(images);
            if (imageRound.round === "image" && imageRound.images) {
              updatePlayback({
                currentRound: "image",
                currentImages: imageRound.images,
              });
            }
          }
        } else if (nextRound.round === "image" && nextRound.images) {
          // まだ画像スロットが残っている場合
          updatePlayback({
            currentRound: "image",
            currentImages: nextRound.images,
          });
        }
      }, settings.media.imageDuration * 1000);
    }

    return () => {
      if (videoTimeoutRef.current) clearTimeout(videoTimeoutRef.current);
      if (imageTimeoutRef.current) clearTimeout(imageTimeoutRef.current);
    };
  }, [
    playback.currentRound,
    playback.isPlaying,
    playback.currentVideoDuration,
    playback.currentVideoId,
    playback.currentImages,
    images,
    roundConductor,
    updatePlayback,
    videoScheduler,
    settings.media.imageDuration,
    settings.media.videoSeconds.fixed,
  ]);

  const handleNextRound = () => {
    const nextRound = roundConductor.nextRound(images);

    if (nextRound.round === "video") {
      // 動画に戻る
      const currentVideo = videoScheduler.getCurrentVideo();
      if (currentVideo) {
        updatePlayback({
          currentRound: "video",
          currentVideoId: currentVideo.src,
        });
      }
    } else if (nextRound.round === "image" && nextRound.images) {
      // 次の画像スロット
      updatePlayback({
        currentRound: "image",
        currentImages: nextRound.images,
      });

      // 画像表示時間
      imageTimeoutRef.current = setTimeout(() => {
        handleNextRound();
      }, settings.media.imageDuration * 1000);
    }
  };

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        updatePlayback({ isPlaying: !playback.isPlaying });
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playback.isPlaying, updatePlayback]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-menu-container]')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-white"
    >
      {/* メディアレイヤー */}
      <div className="absolute inset-0 z-media">
        <MediaPlayer />
      </div>

      {/* カレンダーレイヤー */}
      <div className="absolute inset-0 z-calendar pointer-events-none">
        <Calendar />
      </div>

      {/* コントロールレイヤー */}
      <div className="absolute inset-0 z-controls pointer-events-none">
        {/* ハンバーガーメニュー */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-auto" data-menu-container>
          <button
            className="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 hover:bg-black/20 text-black rounded-full backdrop-blur-sm transition-all border border-black/20 flex items-center justify-center"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* メニュードロップダウン */}
          {showMenu && (
            <div className="absolute top-12 sm:top-14 right-0 bg-white/20 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden min-w-[160px] sm:min-w-[180px] border border-white/30">
              <button
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-gray-900"
                onClick={() => {
                  setShowMediaLibrary(true);
                  setShowMenu(false);
                }}
              >
                <span className="text-sm sm:text-base">📁</span>
                <span className="text-xs sm:text-sm font-medium">メディアライブラリ</span>
              </button>
              <button
                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 text-gray-900 border-t border-white/20"
                onClick={() => {
                  setShowSettings(true);
                  setShowMenu(false);
                }}
              >
                <span className="text-sm sm:text-base">⚙️</span>
                <span className="text-xs sm:text-sm font-medium">設定</span>
              </button>
            </div>
          )}
        </div>

        {/* 再生/停止ボタン */}
        <button
          className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-black/10 hover:bg-black/20 text-black text-xs sm:text-sm rounded-full backdrop-blur-sm transition-colors border border-black/20"
          onClick={() => updatePlayback({ isPlaying: !playback.isPlaying })}
        >
          {playback.isPlaying ? "⏸ 停止" : "▶ 再生"}
        </button>
      </div>

      {/* 設定パネル */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* メディアライブラリ */}
      {showMediaLibrary && (
        <MediaLibrary onClose={() => setShowMediaLibrary(false)} />
      )}
    </div>
  );
}
