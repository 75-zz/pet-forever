import type { ImageItem, VideoItem } from "../types";

/**
 * base64文字列をBlobに変換
 */
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * ファイル名の拡張子を取得
 */
function getExtensionFromBase64(base64: string): string {
  const mimeMatch = base64.match(/^data:([^;]+);/);
  if (!mimeMatch) return "";

  const mime = mimeMatch[1];
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };

  return extensions[mime] || "bin";
}

/**
 * 画像を個別にダウンロード
 */
export function downloadImage(image: ImageItem, index: number) {
  const blob = base64ToBlob(image.src);
  const ext = getExtensionFromBase64(image.src);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = image.fileName || `image_${index + 1}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 動画を個別にダウンロード
 */
export function downloadVideo(video: VideoItem, index: number) {
  const blob = base64ToBlob(video.src);
  const ext = getExtensionFromBase64(video.src);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = video.fileName || `video_${index + 1}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * すべての画像を一括ダウンロード
 */
export async function exportAllImages(images: ImageItem[]) {
  for (let i = 0; i < images.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // ブラウザの連続ダウンロード制限を回避
    downloadImage(images[i], i);
  }
}

/**
 * すべての動画を一括ダウンロード
 */
export async function exportAllVideos(videos: VideoItem[]) {
  for (let i = 0; i < videos.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // ブラウザの連続ダウンロード制限を回避
    downloadVideo(videos[i], i);
  }
}

/**
 * すべてのメディアを一括ダウンロード
 */
export async function exportAllMedia(images: ImageItem[], videos: VideoItem[]) {
  // 画像をエクスポート
  for (let i = 0; i < images.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    downloadImage(images[i], i);
  }

  // 動画をエクスポート
  for (let i = 0; i < videos.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    downloadVideo(videos[i], i);
  }
}

/**
 * 画像に自動命名規則を適用
 */
export function autoRenameImages(images: ImageItem[]): ImageItem[] {
  return images.map((img, index) => {
    const ext = getExtensionFromBase64(img.src);
    return {
      ...img,
      fileName: `image_${index + 1}.${ext}`,
    };
  });
}

/**
 * 動画に自動命名規則を適用
 */
export function autoRenameVideos(videos: VideoItem[]): VideoItem[] {
  return videos.map((vid, index) => {
    const ext = getExtensionFromBase64(vid.src);
    return {
      ...vid,
      fileName: `video_${index + 1}.${ext}`,
    };
  });
}

/**
 * すべてのメディアに自動命名規則を適用
 */
export function autoRenameAllMedia(
  images: ImageItem[],
  videos: VideoItem[]
): { images: ImageItem[]; videos: VideoItem[] } {
  return {
    images: autoRenameImages(images),
    videos: autoRenameVideos(videos),
  };
}
