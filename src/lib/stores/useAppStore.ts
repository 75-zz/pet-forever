import { create } from "zustand";
import type {
  AppSettings,
  ImageItem,
  VideoItem,
  WeeklySchedule,
  PlaybackState,
  AppState,
} from "../types";
import { DEFAULT_SETTINGS } from "../types";
import { storageRepo } from "../db/StorageRepo";

/**
 * Zustand アプリケーションストア
 */
export const useAppStore = create<AppState>((set, get) => ({
  // 初期状態
  settings: DEFAULT_SETTINGS,
  images: [],
  videos: [],
  weeklySchedule: {},
  playback: {
    isPlaying: false,
    currentRound: "video",
    imageSlotIndex: 0,
  },

  // === アクション ===

  /**
   * 設定を更新
   */
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));

    // IndexedDBに永続化
    storageRepo.saveSettings(get().settings);
  },

  /**
   * 画像を追加
   */
  addImages: (newImages) => {
    set((state) => ({
      images: [...state.images, ...newImages],
    }));

    // IndexedDBに永続化
    storageRepo.saveImages(get().images);
  },

  /**
   * 動画を追加
   */
  addVideos: (newVideos) => {
    set((state) => ({
      videos: [...state.videos, ...newVideos],
    }));

    // IndexedDBに永続化
    storageRepo.saveVideos(get().videos);
  },

  /**
   * 画像を一括更新（リネーム用）
   */
  updateImages: (updatedImages) => {
    set({ images: updatedImages });
    
    // IndexedDBに永続化
    storageRepo.saveImages(updatedImages);
  },

  /**
   * 動画を一括更新（リネーム用）
   */
  updateVideos: (updatedVideos) => {
    set({ videos: updatedVideos });
    
    // IndexedDBに永続化
    storageRepo.saveVideos(updatedVideos);
  },

  /**
   * 画像を削除
   */
  removeImage: (id) => {
    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
    }));

    // IndexedDBから削除
    storageRepo.deleteImage(id);
  },

  /**
   * 動画を削除
   */
  removeVideo: (id) => {
    set((state) => ({
      videos: state.videos.filter((vid) => vid.id !== id),
    }));

    // IndexedDBから削除
    storageRepo.deleteVideo(id);
  },

  /**
   * 画像のタグを更新
   */
  updateImageTags: (id, tags) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, tags } : img
      ),
    }));

    // IndexedDBに永続化
    const image = get().images.find((img) => img.id === id);
    if (image) {
      storageRepo.saveImage(image);
    }
  },

  /**
   * 週に動画を割り当て
   */
  assignVideoToWeek: (weekNumber, videoId) => {
    set((state) => ({
      weeklySchedule: {
        ...state.weeklySchedule,
        [weekNumber]: videoId,
      },
    }));

    // IndexedDBに永続化
    storageRepo.saveSchedule(get().weeklySchedule);
  },

  /**
   * 再生状態を更新
   */
  updatePlayback: (newPlayback) => {
    set((state) => ({
      playback: { ...state.playback, ...newPlayback },
    }));
  },

  /**
   * すべてのデータをリセット
   */
  resetAllData: async () => {
    set({
      settings: DEFAULT_SETTINGS,
      images: [],
      videos: [],
      weeklySchedule: {},
      playback: {
        isPlaying: false,
        currentRound: "video",
        imageSlotIndex: 0,
      },
    });

    // IndexedDBをクリア
    await storageRepo.clearAll();
  },
}));

/**
 * 設定のディープマージ（デフォルト値で不足しているプロパティを補完）
 */
function mergeSettings(
  stored: AppSettings | undefined,
  defaults: AppSettings
): AppSettings {
  if (!stored) return defaults;

  return {
    locale: stored.locale ?? defaults.locale,
    calendar: {
      mode: stored.calendar?.mode ?? defaults.calendar.mode,
      position: stored.calendar?.position ?? defaults.calendar.position,
      showYear: stored.calendar?.showYear ?? defaults.calendar.showYear,
      showWeekday: stored.calendar?.showWeekday ?? defaults.calendar.showWeekday,
      weekStart: stored.calendar?.weekStart ?? defaults.calendar.weekStart,
      locale: stored.calendar?.locale ?? defaults.calendar.locale,
      visible: stored.calendar?.visible ?? defaults.calendar.visible,
      font: stored.calendar?.font ?? defaults.calendar.font,
      textColor: stored.calendar?.textColor ?? defaults.calendar.textColor,
      size: stored.calendar?.size ?? defaults.calendar.size,
    },
    media: {
      videoSeconds: stored.media?.videoSeconds ?? defaults.media.videoSeconds,
      imageSlots: stored.media?.imageSlots ?? defaults.media.imageSlots,
      imageDuration: stored.media?.imageDuration ?? defaults.media.imageDuration,
      randomRotation: stored.media?.randomRotation ?? defaults.media.randomRotation,
      randomPosition: stored.media?.randomPosition ?? defaults.media.randomPosition,
      randomScale: stored.media?.randomScale ?? defaults.media.randomScale,
      audioEnabled: stored.media?.audioEnabled ?? defaults.media.audioEnabled,
      audioVolume: stored.media?.audioVolume ?? defaults.media.audioVolume,
      fadeInDuration: stored.media?.fadeInDuration ?? defaults.media.fadeInDuration,
      fadeOutDuration: stored.media?.fadeOutDuration ?? defaults.media.fadeOutDuration,
      animationSpeed: stored.media?.animationSpeed ?? defaults.media.animationSpeed,
    },
    diversity: {
      historyWindow: stored.diversity?.historyWindow ?? defaults.diversity.historyWindow,
      tagSeparation: stored.diversity?.tagSeparation ?? defaults.diversity.tagSeparation,
      rarityBoost: stored.diversity?.rarityBoost ?? defaults.diversity.rarityBoost,
    },
    anniversaries: stored.anniversaries ?? defaults.anniversaries,
  };
}

/**
 * 初期化: IndexedDBからデータをロード
 */
export async function initializeStore() {
  await storageRepo.init();

  const [settings, schedule, images, videos] = await Promise.all([
    storageRepo.getSettings(),
    storageRepo.getSchedule(),
    storageRepo.getAllImages(),
    storageRepo.getAllVideos(),
  ]);

  useAppStore.setState({
    settings: mergeSettings(settings, DEFAULT_SETTINGS),
    weeklySchedule: schedule || {},
    images: images || [],
    videos: videos || [],
  });
}
