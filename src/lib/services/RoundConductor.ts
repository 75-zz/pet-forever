import type {
  ImageItem,
  VideoItem,
  MediaSettings,
  ImageDisplayProps,
} from "../types";
import { DiversityPicker } from "./DiversityPicker";

/**
 * 再生ラウンドを管理するコンダクター
 */
export class RoundConductor {
  private settings: MediaSettings;
  private diversityPicker: DiversityPicker;
  private currentRound: "video" | "image";
  private imageSlotIndex: number;

  constructor(settings: MediaSettings, diversityPicker: DiversityPicker) {
    this.settings = settings;
    this.diversityPicker = diversityPicker;
    this.currentRound = "video";
    this.imageSlotIndex = 0;
  }

  /**
   * 次のラウンドに進む
   */
  nextRound(images: ImageItem[]): {
    round: "video" | "image";
    images?: { item: ImageItem; props: ImageDisplayProps }[];
  } {
    if (this.currentRound === "video") {
      // 動画の次は画像
      this.currentRound = "image";
      this.imageSlotIndex = 0;
      return this.getImageRound(images);
    } else {
      // 画像スロットをカウント
      this.imageSlotIndex++;

      if (this.imageSlotIndex >= this.settings.imageSlots) {
        // 画像スロットを使い切ったら動画に戻る
        this.currentRound = "video";
        this.imageSlotIndex = 0;
        return { round: "video" };
      } else {
        // 次の画像スロット
        return this.getImageRound(images);
      }
    }
  }

  /**
   * 画像ラウンドを取得
   */
  private getImageRound(images: ImageItem[]): {
    round: "image";
    images: { item: ImageItem; props: ImageDisplayProps }[];
  } {
    // 1枚または2枚をランダムに選択
    const imageCount = Math.random() < 0.5 ? 1 : 2;
    const selectedImages = this.diversityPicker.pickImages(images, imageCount);

    // ランダムプロパティを生成
    const imagesWithProps = selectedImages.map((item) => ({
      item,
      props: this.generateRandomProps(),
    }));

    return {
      round: "image",
      images: imagesWithProps,
    };
  }

  /**
   * ランダム表示プロパティを生成
   */
  private generateRandomProps(): ImageDisplayProps {
    const { randomRotation, randomPosition, randomScale } = this.settings;

    const rotation = randomRotation
      ? this.randomRange(-10, 10)
      : 0;

    const offsetX = randomPosition
      ? this.randomRange(-80, 80)
      : 0;

    const offsetY = randomPosition
      ? this.randomRange(-120, 120)
      : 0;

    const scale = randomScale
      ? this.randomRange(0.6, 0.9)
      : 0.8;

    return {
      rotation,
      offsetX,
      offsetY,
      scale,
    };
  }

  /**
   * 範囲内のランダムな数値を生成
   */
  private randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * 動画の再生時間を取得（秒）
   */
  getVideoSeconds(): number {
    const { videoSeconds } = this.settings;

    if (videoSeconds.fixed !== undefined) {
      return videoSeconds.fixed;
    }

    return this.randomRange(videoSeconds.min, videoSeconds.max);
  }

  /**
   * 現在のラウンドを取得
   */
  getCurrentRound(): "video" | "image" {
    return this.currentRound;
  }

  /**
   * 現在の画像スロットインデックスを取得
   */
  getImageSlotIndex(): number {
    return this.imageSlotIndex;
  }

  /**
   * ラウンドをリセット（動画から開始）
   */
  reset(): void {
    this.currentRound = "video";
    this.imageSlotIndex = 0;
  }

  /**
   * 設定を更新
   */
  updateSettings(settings: MediaSettings): void {
    this.settings = settings;
  }
}
