// メディアアイテム型定義

export interface ImageItem {
  id: string;
  src: string; // Data URL or Blob URL
  fileName?: string; // ファイル名（拡張子含む）
  tags?: string[];
  takenAt?: string; // ISO 8601 date string
  weight?: number; // 希少度重み (デフォルト1.0)
  displayCount?: number; // 表示回数
}

export interface VideoItem {
  id: string;
  src: string; // Data URL or Blob URL
  fileName?: string; // ファイル名（拡張子含む）
  label?: string; // 第1週、第2週 etc
  weekNumber?: number; // 1-4
}

// カレンダー設定

export type WeekStart = "sun" | "mon";
export type CalendarMode = "day" | "month";
export type Locale = "ja" | "en";
export type CalendarPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type CalendarFont =
  | "roboto"
  | "montserrat"
  | "questrial"
  | "anton"
  | "lato"
  | "cormorant-garamond"
  | "libre-baskerville";

export type CalendarSize = "small" | "medium" | "large";

export interface CalendarSettings {
  mode: CalendarMode;
  position: CalendarPosition;
  showYear: boolean;
  showWeekday: boolean;
  weekStart: WeekStart;
  locale: Locale;
  visible: boolean; // カレンダー表示のON/OFF
  font: CalendarFont; // フォント選択
  textColor: string; // カレンダーの文字色
  size: CalendarSize; // 文字サイズ（小・中・大）
  useCustomPosition: boolean; // カスタム位置を使用するか
  customPosition: { x: number; y: number }; // カスタム位置（ピクセル座標）
  isDraggable: boolean; // ドラッグ可能かどうか
}

// メディア表示設定

export interface MediaSettings {
  videoSeconds: {
    min: number; // 10
    max: number; // 20
    fixed?: number; // 固定値を指定する場合
  };
  imageSlots: number; // 2-4
  imageDuration: number; // 画像表示時間（秒）
  randomRotation: boolean; // -10°〜+10°
  randomPosition: boolean; // X±24〜80px / Y±48〜120px
  randomScale: boolean; // 60%〜90%
  audioEnabled: boolean;
  audioVolume: number; // 0-100
  // アニメーション設定
  fadeInDuration: number; // フェードイン時間（秒）
  fadeOutDuration: number; // フェードアウト時間（秒）
  animationSpeed: number; // アニメーション速度（1.0が標準、0.5で遅く、2.0で速く）
}

// 多様性設定

export type TagSeparation = "low" | "medium" | "high";

export interface DiversitySettings {
  historyWindow: number; // 直近K枚を除外 (デフォルト20)
  tagSeparation: TagSeparation; // タグ分散レベル
  rarityBoost: number; // 希少度ブースト係数 (デフォルト1.5)
}

// 記念日設定

export interface Anniversary {
  id: string;
  date: string; // MM-DD
  label: string;
  icon?: string; // ⭐/❤️ etc
  color?: string; // hex color
}

// 全体設定

export interface AppSettings {
  locale: Locale;
  calendar: CalendarSettings;
  media: MediaSettings;
  diversity: DiversitySettings;
  anniversaries: Anniversary[];
}

// 週次スケジュール

export interface WeeklySchedule {
  [weekNumber: number]: string; // weekNumber -> videoId
}

// 画像表示プロパティ（ランダム化後）

export interface ImageDisplayProps {
  rotation: number; // degrees
  offsetX: number; // px
  offsetY: number; // px
  scale: number; // 0-1
}

// 再生状態

export interface PlaybackState {
  isPlaying: boolean;
  currentRound: "video" | "image";
  currentVideoId?: string;
  currentVideoDuration?: number; // 動画の実際の長さ（秒）
  currentImages?: {
    item: ImageItem;
    props: ImageDisplayProps;
  }[];
  imageSlotIndex: number; // 現在の画像スロット番号 (0-3)
}

// アプリ全体の状態 (Zustand Store用)

export interface AppState {
  settings: AppSettings;
  images: ImageItem[];
  videos: VideoItem[];
  weeklySchedule: WeeklySchedule;
  playback: PlaybackState;
  // アクション
  updateSettings: (settings: Partial<AppSettings>) => void;
  addImages: (images: ImageItem[]) => void;
  addVideos: (videos: VideoItem[]) => void;
  updateImages: (images: ImageItem[]) => void;
  updateVideos: (videos: VideoItem[]) => void;
  removeImage: (id: string) => void;
  removeVideo: (id: string) => void;
  clearAllImages: () => void;
  clearAllVideos: () => void;
  clearAllMedia: () => void;
  updateImageTags: (id: string, tags: string[]) => void;
  assignVideoToWeek: (weekNumber: number, videoId: string) => void;
  updatePlayback: (playback: Partial<PlaybackState>) => void;
  resetAllData: () => void;
}

// デフォルト設定

export const DEFAULT_SETTINGS: AppSettings = {
  locale: "ja",
  calendar: {
    mode: "day",
    position: "bottom-left",
    showYear: true,
    showWeekday: true,
    weekStart: "mon",
    locale: "ja",
    visible: true,
    font: "roboto",
    textColor: "#000000",
    size: "medium",
    useCustomPosition: false,
    customPosition: { x: 32, y: 32 },
    isDraggable: true,
  },
  media: {
    videoSeconds: {
      min: 10,
      max: 20,
      fixed: 8,
    },
    imageSlots: 3,
    imageDuration: 5,
    randomRotation: false,
    randomPosition: false,
    randomScale: false,
    audioEnabled: true,
    audioVolume: 50,
    fadeInDuration: 1.0,
    fadeOutDuration: 1.0,
    animationSpeed: 1.0,
  },
  diversity: {
    historyWindow: 20,
    tagSeparation: "medium",
    rarityBoost: 1.5,
  },
  anniversaries: [],
};
