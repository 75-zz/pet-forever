"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";
import { CalendarService } from "@/lib/services/CalendarService";
import type { CalendarPosition } from "@/lib/types";

const POSITION_CLASSES: Record<CalendarPosition, string> = {
  "top-left": "top-2 left-2 sm:top-4 sm:left-4 md:top-8 md:left-8",
  "top-right": "top-2 right-2 sm:top-4 sm:right-4 md:top-8 md:right-8",
  "bottom-left": "bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-8 md:left-8",
  "bottom-right": "bottom-2 right-2 sm:bottom-4 sm:right-4 md:bottom-8 md:right-8",
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
  const updateSettings = useAppStore((state) => state.updateSettings);
  const { calendar } = settings;

  const dateStr = service.formatDate(date, "M/d", calendar.showYear);
  const weekday = calendar.showWeekday ? service.getWeekdayName(date) : "";
  const anniversary = service.isAnniversary(date, settings.anniversaries);

  const positionClass = POSITION_CLASSES[calendar.position];
  const fontClass = `font-${calendar.font}`;

  // カレンダーモードを切り替える
  const toggleCalendarMode = () => {
    updateSettings({
      calendar: {
        ...calendar,
        mode: calendar.mode === "day" ? "month" : "day",
      },
    });
  };

  // サイズに応じたクラス（レスポンシブ対応）
  const sizeClasses = {
    small: {
      date: "text-3xl sm:text-4xl md:text-6xl",
      weekday: "text-xl sm:text-2xl md:text-4xl",
      anniversary: "text-sm sm:text-base md:text-xl"
    },
    medium: {
      date: "text-5xl sm:text-6xl md:text-9xl",
      weekday: "text-3xl sm:text-4xl md:text-6xl",
      anniversary: "text-lg sm:text-xl md:text-3xl"
    },
    large: {
      date: "text-7xl sm:text-8xl md:text-[12rem]",
      weekday: "text-4xl sm:text-5xl md:text-8xl",
      anniversary: "text-xl sm:text-2xl md:text-4xl"
    },
  };
  const sizes = sizeClasses[calendar.size];

  return (
    <div
      className={`fixed z-calendar ${positionClass} select-none ${fontClass} cursor-pointer pointer-events-auto`}
      style={{
        color: calendar.textColor,
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
      }}
      onClick={toggleCalendarMode}
      role="button"
      tabIndex={0}
      aria-label="カレンダー表示を切り替え"
    >
      <div className={`${sizes.date} font-bold`}>
        {dateStr}
        {weekday && (
          <span className={`ml-1 sm:ml-2 md:ml-3 ${sizes.weekday}`}>
            {calendar.locale === "ja" ? `(${weekday})` : weekday}
          </span>
        )}
      </div>
      {anniversary && (
        <div className={`mt-1 sm:mt-2 md:mt-3 ${sizes.anniversary} flex items-center gap-1 sm:gap-2`}>
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
  const updateSettings = useAppStore((state) => state.updateSettings);
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

  // カレンダーモードを切り替える
  const toggleCalendarMode = () => {
    updateSettings({
      calendar: {
        ...calendar,
        mode: calendar.mode === "day" ? "month" : "day",
      },
    });
  };

  // サイズに応じたクラス（レスポンシブ対応 + 横向き対応）
  const sizeClasses = {
    small: {
      month: "text-sm sm:text-lg md:text-xl",
      weekday: "text-[10px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8",
      day: "text-[10px] sm:text-xs md:text-sm w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8",
      gap: "gap-0.5 sm:gap-1 md:gap-1.5",
      padding: "p-1.5 sm:p-2 md:p-3",
      marginBottom: "mb-1 sm:mb-1.5 md:mb-2"
    },
    medium: {
      month: "text-base sm:text-xl md:text-2xl",
      weekday: "text-xs sm:text-sm md:text-base w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10",
      day: "text-xs sm:text-sm md:text-base w-6 h-6 sm:w-7 sm:h-7 md:w-10 md:h-10",
      gap: "gap-0.5 sm:gap-1 md:gap-2",
      padding: "p-2 sm:p-2.5 md:p-4",
      marginBottom: "mb-1 sm:mb-2 md:mb-3"
    },
    large: {
      month: "text-lg sm:text-2xl md:text-4xl",
      weekday: "text-sm sm:text-base md:text-lg w-7 h-7 sm:w-9 sm:h-9 md:w-14 md:h-14",
      day: "text-sm sm:text-base md:text-lg w-7 h-7 sm:w-9 sm:h-9 md:w-14 md:h-14",
      gap: "gap-1 sm:gap-1.5 md:gap-2.5",
      padding: "p-2 sm:p-3 md:p-5",
      marginBottom: "mb-1.5 sm:mb-2 md:mb-4"
    },
  };
  const sizes = sizeClasses[calendar.size];

  return (
    <div
      className={`fixed z-calendar ${positionClass} select-none ${fontClass} cursor-pointer pointer-events-auto max-h-screen flex items-center`}
      style={{ color: calendar.textColor }}
      onClick={toggleCalendarMode}
      role="button"
      tabIndex={0}
      aria-label="カレンダー表示を切り替え"
    >
      {/* グラスモーフィズム背景 */}
      <div className={`bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl ${sizes.padding} shadow-xl max-h-[95vh] overflow-hidden`}>
        <div className={`${sizes.month} font-bold ${sizes.marginBottom}`} style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)" }}>
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
