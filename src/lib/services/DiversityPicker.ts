import type { ImageItem, DiversitySettings, TagSeparation } from "../types";
import { ShuffleQueue } from "./ShuffleQueue";

/**
 * 画像の多様性を保つためのピッカー
 */
export class DiversityPicker {
  private settings: DiversitySettings;
  private history: string[]; // 直近の画像IDの履歴
  private tagHistory: Map<string, number>; // タグの最後の使用位置

  constructor(settings: DiversitySettings) {
    this.settings = settings;
    this.history = [];
    this.tagHistory = new Map();
  }

  /**
   * 画像を選択（多様性を考慮）
   */
  pickImages(
    images: ImageItem[],
    count: number = 2
  ): ImageItem[] {
    if (images.length === 0) return [];

    const selectedImages: ImageItem[] = [];

    for (let i = 0; i < count; i++) {
      const candidates = this.filterCandidates(images, selectedImages);
      if (candidates.length === 0) break;

      const weights = this.calculateWeights(candidates);
      const queue = new ShuffleQueue<ImageItem>();
      queue.setItems(candidates, weights);

      const selected = queue.pickWeighted();
      if (selected) {
        selectedImages.push(selected);
        this.recordSelection(selected);
      }
    }

    return selectedImages;
  }

  /**
   * 候補をフィルタリング
   */
  private filterCandidates(
    allImages: ImageItem[],
    alreadySelected: ImageItem[]
  ): ImageItem[] {
    return allImages.filter((img) => {
      // すでに選択済み
      if (alreadySelected.find((s) => s.id === img.id)) {
        return false;
      }

      // 履歴ウィンドウ内に存在
      if (this.history.includes(img.id)) {
        return false;
      }

      // タグ分散チェック
      if (!this.checkTagSeparation(img, alreadySelected)) {
        return false;
      }

      return true;
    });
  }

  /**
   * タグ分散チェック
   */
  private checkTagSeparation(
    image: ImageItem,
    alreadySelected: ImageItem[]
  ): boolean {
    if (!image.tags || image.tags.length === 0) return true;

    const separation = this.getTagSeparationThreshold();

    for (const tag of image.tags) {
      const lastUsed = this.tagHistory.get(tag);
      if (lastUsed !== undefined) {
        const distance = this.history.length - lastUsed;
        if (distance < separation) {
          return false;
        }
      }

      // 既に選択された画像と同じタグを持つかチェック
      const hasSameTag = alreadySelected.some(
        (selected) => selected.tags && selected.tags.includes(tag)
      );
      if (hasSameTag) {
        return false;
      }
    }

    return true;
  }

  /**
   * タグ分散の閾値を取得
   */
  private getTagSeparationThreshold(): number {
    const { tagSeparation } = this.settings;

    switch (tagSeparation) {
      case "low":
        return 1;
      case "medium":
        return 3;
      case "high":
        return 5;
      default:
        return 3;
    }
  }

  /**
   * 重みを計算（希少度ブースト）
   */
  private calculateWeights(candidates: ImageItem[]): Map<ImageItem, number> {
    const weights = new Map<ImageItem, number>();

    // 表示回数の平均を計算
    const displayCounts = candidates.map((img) => img.displayCount || 0);
    const avgDisplayCount =
      displayCounts.reduce((a, b) => a + b, 0) / displayCounts.length || 1;

    for (const img of candidates) {
      const displayCount = img.displayCount || 0;
      const baseWeight = img.weight || 1.0;

      // 希少度ブースト: 表示回数が少ないほど高い重み
      const rarityFactor =
        displayCount < avgDisplayCount
          ? this.settings.rarityBoost
          : 1.0 / this.settings.rarityBoost;

      weights.set(img, baseWeight * rarityFactor);
    }

    return weights;
  }

  /**
   * 選択を記録
   */
  private recordSelection(image: ImageItem): void {
    // 履歴に追加
    this.history.push(image.id);

    // 履歴ウィンドウを超えたら古いものを削除
    if (this.history.length > this.settings.historyWindow) {
      this.history.shift();
    }

    // タグ履歴を更新
    if (image.tags) {
      for (const tag of image.tags) {
        this.tagHistory.set(tag, this.history.length - 1);
      }
    }
  }

  /**
   * 履歴をクリア
   */
  clearHistory(): void {
    this.history = [];
    this.tagHistory.clear();
  }

  /**
   * 設定を更新
   */
  updateSettings(settings: DiversitySettings): void {
    this.settings = settings;
  }

  /**
   * 履歴を取得
   */
  getHistory(): string[] {
    return [...this.history];
  }
}
