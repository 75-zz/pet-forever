import { openDB, DBSchema, IDBPDatabase } from "idb";
import type {
  ImageItem,
  VideoItem,
  AppSettings,
  WeeklySchedule,
} from "../types";

/**
 * IndexedDB スキーマ定義
 */
interface PetForeverDB extends DBSchema {
  images: {
    key: string;
    value: ImageItem;
  };
  videos: {
    key: string;
    value: VideoItem;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
  schedule: {
    key: string;
    value: WeeklySchedule;
  };
}

/**
 * IndexedDB 永続化レイヤー
 */
export class StorageRepo {
  private dbName = "pet-forever-db";
  private version = 1;
  private db: IDBPDatabase<PetForeverDB> | null = null;

  /**
   * データベースを初期化
   */
  async init(): Promise<void> {
    this.db = await openDB<PetForeverDB>(this.dbName, this.version, {
      upgrade(db) {
        // ストアを作成
        if (!db.objectStoreNames.contains("images")) {
          db.createObjectStore("images", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings");
        }
        if (!db.objectStoreNames.contains("schedule")) {
          db.createObjectStore("schedule");
        }
      },
    });
  }

  /**
   * DBを取得（未初期化の場合は初期化）
   */
  private async getDB(): Promise<IDBPDatabase<PetForeverDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // === 画像操作 ===

  async getAllImages(): Promise<ImageItem[]> {
    const db = await this.getDB();
    return db.getAll("images");
  }

  async getImage(id: string): Promise<ImageItem | undefined> {
    const db = await this.getDB();
    return db.get("images", id);
  }

  async saveImage(image: ImageItem): Promise<void> {
    const db = await this.getDB();
    await db.put("images", image);
  }

  async saveImages(images: ImageItem[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction("images", "readwrite");
    await Promise.all([
      ...images.map((img) => tx.store.put(img)),
      tx.done,
    ]);
  }

  async deleteImage(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete("images", id);
  }

  async clearImages(): Promise<void> {
    const db = await this.getDB();
    await db.clear("images");
  }

  // === 動画操作 ===

  async getAllVideos(): Promise<VideoItem[]> {
    const db = await this.getDB();
    return db.getAll("videos");
  }

  async getVideo(id: string): Promise<VideoItem | undefined> {
    const db = await this.getDB();
    return db.get("videos", id);
  }

  async saveVideo(video: VideoItem): Promise<void> {
    const db = await this.getDB();
    await db.put("videos", video);
  }

  async saveVideos(videos: VideoItem[]): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction("videos", "readwrite");
    await Promise.all([
      ...videos.map((vid) => tx.store.put(vid)),
      tx.done,
    ]);
  }

  async deleteVideo(id: string): Promise<void> {
    const db = await this.getDB();
    await db.delete("videos", id);
  }

  async clearVideos(): Promise<void> {
    const db = await this.getDB();
    await db.clear("videos");
  }

  // === 設定操作 ===

  async getSettings(): Promise<AppSettings | undefined> {
    const db = await this.getDB();
    return db.get("settings", "app-settings");
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await this.getDB();
    await db.put("settings", settings, "app-settings");
  }

  // === スケジュール操作 ===

  async getSchedule(): Promise<WeeklySchedule | undefined> {
    const db = await this.getDB();
    return db.get("schedule", "weekly-schedule");
  }

  async saveSchedule(schedule: WeeklySchedule): Promise<void> {
    const db = await this.getDB();
    await db.put("schedule", schedule, "weekly-schedule");
  }

  // === 全データ削除 ===

  async clearAll(): Promise<void> {
    const db = await this.getDB();
    await Promise.all([
      db.clear("images"),
      db.clear("videos"),
      db.clear("settings"),
      db.clear("schedule"),
    ]);
  }

  // === エクスポート/インポート ===

  async exportData(): Promise<{
    settings: AppSettings | undefined;
    schedule: WeeklySchedule | undefined;
    images: ImageItem[];
    videos: VideoItem[];
  }> {
    return {
      settings: await this.getSettings(),
      schedule: await this.getSchedule(),
      images: await this.getAllImages(),
      videos: await this.getAllVideos(),
    };
  }

  async importData(data: {
    settings?: AppSettings;
    schedule?: WeeklySchedule;
    images?: ImageItem[];
    videos?: VideoItem[];
  }): Promise<void> {
    if (data.settings) {
      await this.saveSettings(data.settings);
    }
    if (data.schedule) {
      await this.saveSchedule(data.schedule);
    }
    if (data.images) {
      await this.saveImages(data.images);
    }
    if (data.videos) {
      await this.saveVideos(data.videos);
    }
  }
}

// シングルトンインスタンス
export const storageRepo = new StorageRepo();
