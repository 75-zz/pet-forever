"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/stores/useAppStore";

export function Settings({ onClose }: { onClose: () => void }) {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto m-4 text-gray-900">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-8 py-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-black">設定</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-2xl"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-8 space-y-8">
          {/* 基本設定 */}
          <section>
            <h3 className="text-xl font-bold text-black mb-4">基本設定</h3>
            <div className="space-y-4">
              {/* 言語 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  言語
                </label>
                <select
                  value={localSettings.locale}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      locale: e.target.value as "ja" | "en",
                      calendar: {
                        ...localSettings.calendar,
                        locale: e.target.value as "ja" | "en",
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>

            </div>
          </section>

          {/* カレンダー設定 */}
          <section>
            <h3 className="text-xl font-bold text-black mb-4">
              カレンダー設定
            </h3>
            <div className="space-y-4">
              {/* カレンダー表示 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  カレンダー表示
                </label>
                <button
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      calendar: {
                        ...localSettings.calendar,
                        visible: !localSettings.calendar.visible,
                      },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.calendar.visible
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.calendar.visible
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* カレンダーモード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示モード
                </label>
                <select
                  value={localSettings.calendar.mode}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      calendar: {
                        ...localSettings.calendar,
                        mode: e.target.value as "day" | "month",
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!localSettings.calendar.visible}
                >
                  <option value="day">1日表示</option>
                  <option value="month">1か月表示</option>
                </select>
              </div>

              {/* 週開始曜日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  週の開始曜日
                </label>
                <select
                  value={localSettings.calendar.weekStart}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      calendar: {
                        ...localSettings.calendar,
                        weekStart: e.target.value as "sun" | "mon",
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!localSettings.calendar.visible}
                >
                  <option value="sun">日曜日</option>
                  <option value="mon">月曜日</option>
                </select>
              </div>

              {/* カレンダー位置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示位置
                </label>
                <select
                  value={localSettings.calendar.position}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      calendar: {
                        ...localSettings.calendar,
                        position: e.target.value as any,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!localSettings.calendar.visible}
                >
                  <option value="top-left">左上</option>
                  <option value="top-right">右上</option>
                  <option value="bottom-left">左下</option>
                  <option value="bottom-right">右下</option>
                </select>
              </div>

              {/* フォント選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フォント
                </label>
                <div className="space-y-2">
                  {[
                    { value: "roboto", label: "Roboto" },
                    { value: "montserrat", label: "Montserrat" },
                    { value: "questrial", label: "Questrial" },
                    { value: "anton", label: "Anton" },
                    { value: "lato", label: "Lato" },
                    { value: "cormorant-garamond", label: "Cormorant Garamond" },
                    { value: "libre-baskerville", label: "Libre Baskerville" },
                  ].map((font) => (
                    <label
                      key={font.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        localSettings.calendar.font === font.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!localSettings.calendar.visible ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="font"
                        value={font.value}
                        checked={localSettings.calendar.font === font.value}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            calendar: {
                              ...localSettings.calendar,
                              font: e.target.value as any,
                            },
                          })
                        }
                        disabled={!localSettings.calendar.visible}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {font.label}
                        </div>
                        <div
                          className={`text-2xl font-bold text-gray-700 font-${font.value}`}
                        >
                          11/7 (Thu)
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* カレンダーの文字色 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カレンダーの文字色
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={localSettings.calendar.textColor}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        calendar: {
                          ...localSettings.calendar,
                          textColor: e.target.value,
                        },
                      })
                    }
                    disabled={!localSettings.calendar.visible}
                    className="h-10 w-20 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-600">
                    {localSettings.calendar.textColor}
                  </span>
                </div>
              </div>

              {/* カレンダーの文字サイズ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  カレンダーの文字サイズ
                </label>
                <div className="space-y-2">
                  {[
                    { value: "small", label: "小" },
                    { value: "medium", label: "中" },
                    { value: "large", label: "大" },
                  ].map((size) => (
                    <label
                      key={size.value}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        localSettings.calendar.size === size.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      } ${!localSettings.calendar.visible ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.value}
                        checked={localSettings.calendar.size === size.value}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            calendar: {
                              ...localSettings.calendar,
                              size: e.target.value as any,
                            },
                          })
                        }
                        disabled={!localSettings.calendar.visible}
                        className="mr-3"
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {size.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* メディア設定 */}
          <section>
            <h3 className="text-xl font-bold text-black mb-4">メディア設定</h3>
            <div className="space-y-4">
              {/* 画像表示時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像表示時間: {localSettings.media.imageDuration}秒
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={localSettings.media.imageDuration}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      media: {
                        ...localSettings.media,
                        imageDuration: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* フェードイン時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フェードイン時間: {localSettings.media.fadeInDuration}秒
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={localSettings.media.fadeInDuration}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      media: {
                        ...localSettings.media,
                        fadeInDuration: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* フェードアウト時間 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  フェードアウト時間: {localSettings.media.fadeOutDuration}秒
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={localSettings.media.fadeOutDuration}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      media: {
                        ...localSettings.media,
                        fadeOutDuration: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>

              {/* アニメーション速度 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アニメーション速度: {localSettings.media.animationSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={localSettings.media.animationSpeed}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      media: {
                        ...localSettings.media,
                        animationSpeed: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>遅い</span>
                  <span>速い</span>
                </div>
              </div>

              {/* 音量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  音量: {localSettings.media.audioVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={localSettings.media.audioVolume}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      media: {
                        ...localSettings.media,
                        audioVolume: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </section>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t px-8 py-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
