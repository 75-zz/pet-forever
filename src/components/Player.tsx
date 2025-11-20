"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { Calendar } from "./Calendar";
import { MediaPlayer } from "./MediaPlayer";
import { MediaLibrary } from "./MediaLibrary";
import { Settings } from "./Settings";
import { Plan } from "./Plan";
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
  const [showPlan, setShowPlan] = useState(false);
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

  // 次の動画を再生する関数（連番順）
  const handleNextVideo = () => {
    if (videos.length === 0) return;

    // 現在再生中の動画のインデックスを取得
    const currentVideoId = playback.currentVideoId;
    const currentIndex = videos.findIndex(v => v.src === currentVideoId);

    // 次のインデックスを計算（最後に達したら最初に戻る）
    let nextIndex = 0;
    if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % videos.length;
    }

    const nextVideo = videos[nextIndex];

    if (nextVideo) {
      // 次の動画を表示して通常の再生フローを開始
      updatePlayback({
        currentRound: "video",
        currentVideoId: nextVideo.src,
        isPlaying: true,
        currentVideoDuration: undefined, // 新しい動画なので長さをリセット
      });

      // RoundConductorをリセットして動画から開始
      roundConductor.reset();
    }
  };


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
        {/* ハンバーガーメニューボタン */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 pointer-events-auto">
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
        </div>

        {/* コントロールボタン群 */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2">
          {/* 再生/停止ボタン */}
          <button
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/10 hover:bg-black/20 text-black text-xs sm:text-sm rounded-full backdrop-blur-sm transition-colors border border-black/20"
            onClick={() => updatePlayback({ isPlaying: !playback.isPlaying })}
          >
            {playback.isPlaying ? "⏸ 停止" : "▶ 再生"}
          </button>

          {/* 次の動画ボタン */}
          {videos.length > 1 && (
            <button
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-900 text-xs sm:text-sm rounded-full backdrop-blur-sm transition-colors border border-blue-500/40"
              onClick={handleNextVideo}
            >
              📹 次の動画
            </button>
          )}
        </div>
      </div>

      {/* サイドメニュー */}
      <>
        {/* オーバーレイ */}
        <div
          className={`fixed inset-0 z-[250] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            showMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowMenu(false)}
        />

        {/* スライドメニュー */}
        <div
          className={`fixed top-0 right-0 h-full z-[260] w-72 sm:w-80 bg-white/20 backdrop-blur-xl shadow-2xl border-l border-white/30 transform transition-transform duration-300 ease-out ${
            showMenu ? 'translate-x-0' : 'translate-x-full'
          }`}
          data-menu-container
        >
            {/* メニューヘッダー */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/30">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">メニュー</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-gray-700"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* メニューアイテム */}
            <div className="flex flex-col">
              <button
                className="w-full px-4 py-4 sm:px-6 sm:py-5 text-left hover:bg-white/20 transition-colors flex items-center gap-3 border-b border-white/20"
                onClick={() => {
                  setShowMediaLibrary(true);
                  setShowMenu(false);
                }}
              >
                <span className="text-2xl">📁</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-medium text-gray-900">メディアライブラリ</span>
                    <span className="px-2 py-0.5 text-[10px] bg-orange-500 text-white rounded-full font-bold">開発中</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">画像・動画を管理</p>
                </div>
              </button>

              <button
                className="w-full px-4 py-4 sm:px-6 sm:py-5 text-left hover:bg-white/20 transition-colors flex items-center gap-3 border-b border-white/20"
                onClick={() => {
                  setShowSettings(true);
                  setShowMenu(false);
                }}
              >
                <span className="text-2xl">⚙️</span>
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-medium text-gray-900">設定</span>
                  <p className="text-xs text-gray-700 mt-1">カレンダー・メディア設定</p>
                </div>
              </button>

              <button
                className="w-full px-4 py-4 sm:px-6 sm:py-5 text-left hover:bg-white/20 transition-colors flex items-center gap-3 border-b border-white/20"
                onClick={() => {
                  setShowPlan(true);
                  setShowMenu(false);
                }}
              >
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <span className="text-sm sm:text-base font-medium text-gray-900">プラン</span>
                  <p className="text-xs text-gray-700 mt-1">プラン選択</p>
                </div>
              </button>
            </div>
          </div>
      </>

      {/* 設定パネル */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {/* メディアライブラリ */}
      {showMediaLibrary && (
        <MediaLibrary onClose={() => setShowMediaLibrary(false)} />
      )}

      {/* プラン選択 */}
      {showPlan && <Plan onClose={() => setShowPlan(false)} />}
    </div>
  );
}
