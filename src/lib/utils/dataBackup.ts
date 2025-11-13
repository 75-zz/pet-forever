/**
 * データバックアップ・復元ユーティリティ
 * すべてのアプリデータ（設定、画像、動画、スケジュール）をJSON形式でエクスポート/インポート
 */

import type { AppSettings, ImageItem, VideoItem, WeeklySchedule } from "../types";

/**
 * バックアップデータの型定義
 */
export interface BackupData {
  version: string; // バックアップ形式のバージョン
  exportedAt: string; // エクスポート日時（ISO 8601）
  settings: AppSettings;
  images: ImageItem[];
  videos: VideoItem[];
  weeklySchedule: WeeklySchedule;
}

/**
 * すべてのアプリデータをJSON形式でエクスポート
 */
export async function exportAllData(
  settings: AppSettings,
  images: ImageItem[],
  videos: VideoItem[],
  weeklySchedule: WeeklySchedule
): Promise<void> {
  const backupData: BackupData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    settings,
    images,
    videos,
    weeklySchedule,
  };

  // JSONに変換
  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });

  // ファイル名を生成（pet-forever-backup-YYYY-MM-DD.json）
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = `pet-forever-backup-${dateStr}.json`;

  // ダウンロード
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * JSONファイルからデータをインポート
 */
export async function importDataFromFile(
  file: File
): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const backupData = JSON.parse(jsonString) as BackupData;

        // バージョンチェック（将来的な互換性のため）
        if (!backupData.version) {
          throw new Error("Invalid backup file: missing version");
        }

        // 必須フィールドのチェック
        if (
          !backupData.settings ||
          !backupData.images ||
          !backupData.videos ||
          !backupData.weeklySchedule
        ) {
          throw new Error("Invalid backup file: missing required fields");
        }

        resolve(backupData);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse backup file: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

/**
 * バックアップデータの統計情報を取得
 */
export function getBackupStats(backupData: BackupData): {
  imageCount: number;
  videoCount: number;
  exportedAt: string;
} {
  return {
    imageCount: backupData.images.length,
    videoCount: backupData.videos.length,
    exportedAt: new Date(backupData.exportedAt).toLocaleString("ja-JP"),
  };
}
