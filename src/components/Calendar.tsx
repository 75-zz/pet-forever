"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
 * ドラッグ可能なカレンダー用カスタムフック
 */
function useDraggable(isDraggable: boolean) {
  const updateSettings = useAppStore((state) => state.updateSettings);
  const settings = useAppStore((state) => state.settings);
  const { calendar } = settings;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasDraggedRef = useRef(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // ドラッグ開始
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!isDraggable || !elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
    setIsDragging(true);
    hasDraggedRef.current = false;
  };

  // マウスダウン
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // タッチスタート（長押し判定）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable) return;
    const touch = e.touches[0];

    longPressTimerRef.current = setTimeout(() => {
      handleDragStart(touch.clientX, touch.clientY);
    }, 500); // 500ms長押しでドラッグ開始
  };

  // タッチエンド（長押しキャンセル）
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // ドラッグ中の移動
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number, clientY: number) => {
      hasDraggedRef.current = true;
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      // 画面外に出ないように制限
      const maxX = window.innerWidth - (elementRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (elementRef.current?.offsetHeight || 0);

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      // 位置を更新
      updateSettings({
        calendar: {
          ...calendar,
          useCustomPosition: true,
          customPosition: { x: boundedX, y: boundedY },
        },
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragOffset, calendar, updateSettings]);

  return {
    elementRef,
    isDragging,
    hasDragged: hasDraggedRef.current,
    handleMouseDown,
    handleTouchStart,
    handleTouchEnd,
  };
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

  const {
    elementRef,
    isDragging,
    hasDragged,
    handleMouseDown,
    handleTouchStart,
    handleTouchEnd,
  } = useDraggable(calendar.isDraggable);

  const dateStr = service.formatDate(date, "M/d", calendar.showYear);
  const weekday = calendar.showWeekday ? service.getWeekdayName(date) : "";
  const anniversary = service.isAnniversary(date, settings.anniversaries);

  const positionClass = calendar.useCustomPosition
    ? ""
    : POSITION_CLASSES[calendar.position];
  const fontClass = `font-${calendar.font}`;

  // カレンダーモードを切り替える
  const toggleCalendarMode = () => {
    // ドラッグ中またはドラッグした直後は切り替えない
    if (isDragging || hasDragged) return;

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

  const positionStyle = calendar.useCustomPosition
    ? { left: calendar.customPosition.x, top: calendar.customPosition.y }
    : {};

  return (
    <div
      ref={elementRef}
      className={`fixed z-calendar ${positionClass} select-none ${fontClass} ${
        calendar.isDraggable ? "cursor-move" : "cursor-pointer"
      } pointer-events-auto ${isDragging ? "opacity-70" : ""}`}
      style={{
        color: calendar.textColor,
        textShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
        ...positionStyle,
      }}
      onClick={toggleCalendarMode}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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

  const {
    elementRef,
    isDragging,
    hasDragged,
    handleMouseDown,
    handleTouchStart,
    handleTouchEnd,
  } = useDraggable(calendar.isDraggable);

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

  const positionClass = calendar.useCustomPosition
    ? ""
    : POSITION_CLASSES[calendar.position];
  const fontClass = `font-${calendar.font}`;

  // カレンダーモードを切り替える
  const toggleCalendarMode = () => {
    // ドラッグ中またはドラッグした直後は切り替えない
    if (isDragging || hasDragged) return;

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

  const positionStyle = calendar.useCustomPosition
    ? { left: calendar.customPosition.x, top: calendar.customPosition.y }
    : {};

  return (
    <div
      ref={elementRef}
      className={`fixed z-calendar ${positionClass} select-none ${fontClass} ${
        calendar.isDraggable ? "cursor-move" : "cursor-pointer"
      } pointer-events-auto max-h-screen flex items-center ${
        isDragging ? "opacity-70" : ""
      }`}
      style={{ color: calendar.textColor, ...positionStyle }}
      onClick={toggleCalendarMode}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
