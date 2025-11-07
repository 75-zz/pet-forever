"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { CalendarService } from "@/lib/services/CalendarService";
import type { CalendarPosition } from "@/lib/types";

const POSITION_CLASSES: Record<CalendarPosition, string> = {
  "top-left": "top-8 left-8",
  "top-right": "top-8 right-8",
  "bottom-left": "bottom-8 left-8",
  "bottom-right": "bottom-8 right-8",
};

export function Calendar() {
  const settings = useAppStore((state) => state.settings);
  const { calendar, locale } = settings;

  const calendarService = useMemo(
    () => new CalendarService(locale, calendar.weekStart),
    [locale, calendar.weekStart]
  );

  const currentDate = new Date();

  // カレンダー表示がOFFの場合は何も表示しない
  if (!calendar.visible) {
    return null;
  }

  if (calendar.mode === "day") {
    return <DayCalendar service={calendarService} date={currentDate} />;
  } else {
    return <MonthCalendar service={calendarService} date={currentDate} />;
  }
}

/**
 * 1日表示カレンダー
 */
function DayCalendar({
  service,
  date,
}: {
  service: CalendarService;
  date: Date;
}) {
  const settings = useAppStore((state) => state.settings);
  const { calendar } = settings;

  const dateStr = service.formatDate(date, "M/d", calendar.showYear);
  const weekday = calendar.showWeekday ? service.getWeekdayName(date) : "";
  const anniversary = service.isAnniversary(date, settings.anniversaries);

  const positionClass = POSITION_CLASSES[calendar.position];
  const fontClass = `font-${calendar.font}`;

  // サイズに応じたクラス
  const sizeClasses = {
    small: { date: "text-6xl", weekday: "text-4xl", anniversary: "text-xl" },
    medium: { date: "text-9xl", weekday: "text-6xl", anniversary: "text-3xl" },
    large: { date: "text-[12rem]", weekday: "text-8xl", anniversary: "text-4xl" },
  };
  const sizes = sizeClasses[calendar.size];

  return (
    <div
      className={`fixed z-calendar ${positionClass} pointer-events-none select-none ${fontClass}`}
      style={{
        color: calendar.textColor,
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div className={`${sizes.date} font-bold`}>
        {dateStr}
        {weekday && (
          <span className={`ml-3 ${sizes.weekday}`}>
            {calendar.locale === "ja" ? `(${weekday})` : weekday}
          </span>
        )}
      </div>
      {anniversary && (
        <div className={`mt-3 ${sizes.anniversary} flex items-center gap-2`}>
          {anniversary.icon && <span>{anniversary.icon}</span>}
          <span style={{ color: anniversary.color }}>{anniversary.label}</span>
        </div>
      )}
    </div>
  );
}

/**
 * 1か月表示カレンダー
 */
function MonthCalendar({
  service,
  date,
}: {
  service: CalendarService;
  date: Date;
}) {
  const settings = useAppStore((state) => state.settings);
  const { calendar } = settings;

  const grid = service.getMonthCalendarGrid(date);
  const weekdayLabels =
    calendar.locale === "ja"
      ? ["日", "月", "火", "水", "木", "金", "土"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 週開始に合わせて配列を調整
  const adjustedWeekdayLabels =
    calendar.weekStart === "mon"
      ? [...weekdayLabels.slice(1), weekdayLabels[0]]
      : weekdayLabels;

  const monthYear = service.formatDate(date, "yyyy年M月", calendar.showYear);

  const positionClass = POSITION_CLASSES[calendar.position];
  const fontClass = `font-${calendar.font}`;

  // サイズに応じたクラス
  const sizeClasses = {
    small: { month: "text-3xl", weekday: "text-sm w-10 h-10", day: "text-base w-10 h-10", gap: "gap-2", padding: "p-4" },
    medium: { month: "text-5xl", weekday: "text-lg w-14 h-14", day: "text-xl w-14 h-14", gap: "gap-3", padding: "p-6" },
    large: { month: "text-7xl", weekday: "text-2xl w-20 h-20", day: "text-3xl w-20 h-20", gap: "gap-4", padding: "p-8" },
  };
  const sizes = sizeClasses[calendar.size];

  return (
    <div
      className={`fixed z-calendar ${positionClass} pointer-events-none select-none ${fontClass}`}
      style={{ color: calendar.textColor }}
    >
      {/* グラスモーフィズム背景 */}
      <div className={`bg-white/20 backdrop-blur-md rounded-2xl ${sizes.padding} shadow-xl`}>
        <div className={`${sizes.month} font-bold mb-6`} style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}>
          {monthYear}
        </div>
        <div className={`grid grid-cols-7 ${sizes.gap}`}>
          {/* 曜日ヘッダー */}
          {calendar.showWeekday &&
            adjustedWeekdayLabels.map((label, i) => (
              <div
                key={i}
                className={`text-center font-semibold ${sizes.weekday} opacity-90 flex items-center justify-center`}
                style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
              >
                {label}
              </div>
            ))}

          {/* 日付グリッド */}
          {grid.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const isCurrentMonth = service.isCurrentMonth(day, date);
              const isToday = day.toDateString() === new Date().toDateString();
              const anniversary = service.isAnniversary(
                day,
                settings.anniversaries
              );

              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={`text-center ${sizes.day} flex items-center justify-center rounded ${
                    isCurrentMonth ? "opacity-100" : "opacity-40"
                  } ${isToday ? "bg-white/30 font-bold scale-110" : ""}`}
                  style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)" }}
                >
                  <span style={{ color: anniversary?.color }}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
