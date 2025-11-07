import type { VideoItem, WeeklySchedule } from "../types";
import { CalendarService } from "./CalendarService";

/**
 * 週次動画スケジュール管理
 */
export class WeeklyVideoScheduler {
  private calendarService: CalendarService;
  private schedule: WeeklySchedule;
  private videos: VideoItem[];

  constructor(
    calendarService: CalendarService,
    schedule: WeeklySchedule = {},
    videos: VideoItem[] = []
  ) {
    this.calendarService = calendarService;
    this.schedule = schedule;
    this.videos = videos;
  }

  /**
   * 現在の週に対応する動画を取得
   */
  getCurrentVideo(date: Date = new Date()): VideoItem | null {
    // 動画が1つしかない場合は、それを返す
    if (this.videos.length === 1) {
      return this.videos[0];
    }

    const weekNumber = this.calendarService.getWeekNumberOfMonth(date);
    const videoId = this.schedule[weekNumber];

    if (!videoId) {
      return null;
    }

    return this.videos.find((v) => v.id === videoId) || null;
  }

  /**
   * 週番号に動画を割り当て
   */
  assignVideo(weekNumber: number, videoId: string): void {
    if (weekNumber < 1 || weekNumber > 4) {
      throw new Error("週番号は1-4の範囲で指定してください");
    }

    this.schedule[weekNumber] = videoId;
  }

  /**
   * 週番号の動画割り当てを解除
   */
  unassignVideo(weekNumber: number): void {
    delete this.schedule[weekNumber];
  }

  /**
   * スケジュール全体を取得
   */
  getSchedule(): WeeklySchedule {
    return { ...this.schedule };
  }

  /**
   * スケジュールを更新
   */
  updateSchedule(schedule: WeeklySchedule): void {
    this.schedule = { ...schedule };
  }

  /**
   * 動画リストを更新
   */
  updateVideos(videos: VideoItem[]): void {
    this.videos = [...videos];
  }

  /**
   * 特定の週に割り当てられている動画を取得
   */
  getVideoForWeek(weekNumber: number): VideoItem | null {
    const videoId = this.schedule[weekNumber];
    if (!videoId) return null;
    return this.videos.find((v) => v.id === videoId) || null;
  }

  /**
   * すべての週に動画が割り当てられているかチェック
   */
  isFullyScheduled(): boolean {
    return [1, 2, 3, 4].every((week) => this.schedule[week]);
  }
}
