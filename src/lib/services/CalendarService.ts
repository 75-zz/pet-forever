import {
  startOfWeek,
  endOfWeek,
  format,
  getWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addDays,
} from "date-fns";
import { ja } from "date-fns/locale";
import type { WeekStart, Locale, Anniversary } from "../types";

/**
 * カレンダー計算とフォーマットを担当するサービス
 */
export class CalendarService {
  private locale: Locale;
  private weekStart: WeekStart;

  constructor(locale: Locale = "ja", weekStart: WeekStart = "mon") {
    this.locale = locale;
    this.weekStart = weekStart;
  }

  /**
   * 現在の週番号を取得 (1-4, 第5週は設定により4または1)
   */
  getWeekNumberOfMonth(date: Date = new Date()): number {
    const firstDayOfMonth = startOfMonth(date);
    const weekStartsOn = this.weekStart === "sun" ? 0 : 1;

    // 月初からの週数を計算
    const firstWeekStart = startOfWeek(firstDayOfMonth, {
      weekStartsOn: weekStartsOn as 0 | 1,
    });
    const currentWeekStart = startOfWeek(date, {
      weekStartsOn: weekStartsOn as 0 | 1,
    });

    const weeksDiff = Math.floor(
      (currentWeekStart.getTime() - firstWeekStart.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    const weekNumber = weeksDiff + 1;

    // 第5週の場合は4を返す（または1に戻る設定も可能）
    return weekNumber > 4 ? 4 : weekNumber;
  }

  /**
   * 日付を指定フォーマットで文字列化
   */
  formatDate(
    date: Date,
    formatStr: string = "yyyy/M/d",
    showYear: boolean = true
  ): string {
    const locale = this.locale === "ja" ? ja : undefined;
    const actualFormat = showYear ? formatStr : formatStr.replace(/yyyy\/?/, "");
    return format(date, actualFormat, { locale });
  }

  /**
   * 曜日を取得
   */
  getWeekdayName(date: Date, short: boolean = true): string {
    const locale = this.locale === "ja" ? ja : undefined;
    const formatStr = short ? "EEE" : "EEEE";
    return format(date, formatStr, { locale });
  }

  /**
   * 月のカレンダーグリッドを取得 (6週分)
   */
  getMonthCalendarGrid(date: Date = new Date()): Date[][] {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const weekStartsOn = this.weekStart === "sun" ? 0 : 1;

    const calendarStart = startOfWeek(monthStart, {
      weekStartsOn: weekStartsOn as 0 | 1,
    });
    const calendarEnd = endOfWeek(monthEnd, {
      weekStartsOn: weekStartsOn as 0 | 1,
    });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // 6週 × 7日のグリッドに整形
    const grid: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      grid.push(days.slice(i, i + 7));
    }

    // 6週に満たない場合は空の週を追加
    while (grid.length < 6) {
      const lastDay = grid[grid.length - 1][6];
      const nextWeek = Array.from({ length: 7 }, (_, i) =>
        addDays(lastDay, i + 1)
      );
      grid.push(nextWeek);
    }

    return grid;
  }

  /**
   * 日付が当月かどうか
   */
  isCurrentMonth(date: Date, referenceDate: Date = new Date()): boolean {
    return isSameMonth(date, referenceDate);
  }

  /**
   * 記念日かどうかをチェック
   */
  isAnniversary(date: Date, anniversaries: Anniversary[]): Anniversary | null {
    const mmdd = format(date, "MM-dd");
    return anniversaries.find((a) => a.date === mmdd) || null;
  }

  /**
   * 週の開始日を設定
   */
  setWeekStart(weekStart: WeekStart): void {
    this.weekStart = weekStart;
  }

  /**
   * ロケールを設定
   */
  setLocale(locale: Locale): void {
    this.locale = locale;
  }
}
