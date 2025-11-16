"use client";

import { useState } from "react";

interface PlanProps {
  onClose: () => void;
}

type PlanType = "starter" | "week2" | "week3" | null;

export function Plan({ onClose }: PlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);

  const plans = [
    {
      id: "starter" as const,
      name: "スタータープラン",
      icon: "🌟",
      description: "基本的な機能をお試しください",
      features: [
        "動画1本まで",
        "画像無制限",
        "基本カレンダー機能",
      ],
    },
    {
      id: "week2" as const,
      name: "週2動画プラン",
      icon: "⭐",
      description: "より多くの思い出を保存",
      features: [
        "動画2本まで",
        "画像無制限",
        "週ごとの動画切り替え",
        "高度なカレンダー機能",
      ],
    },
    {
      id: "week3" as const,
      name: "週3動画プラン",
      icon: "✨",
      description: "プレミアムな体験を",
      features: [
        "動画3本まで",
        "画像無制限",
        "週ごとの動画切り替え",
        "すべての機能",
        "優先サポート",
      ],
    },
  ];

  const handleSelectPlan = (planId: PlanType) => {
    setSelectedPlan(planId);
    // TODO: 選択後の処理を実装
    console.log("Selected plan:", planId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">プランを選択</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl text-gray-500">×</span>
          </button>
        </div>

        {/* プランカード */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all
                ${
                  selectedPlan === plan.id
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }
              `}
            >
              {/* 選択チェックマーク */}
              {selectedPlan === plan.id && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}

              {/* アイコン */}
              <div className="text-4xl mb-3">{plan.icon}</div>

              {/* プラン名 */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              {/* 説明 */}
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              {/* 機能リスト */}
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* フッター（選択ボタン） */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                if (selectedPlan) {
                  // TODO: プラン選択後の処理を実装
                  console.log("Confirmed plan:", selectedPlan);
                  onClose();
                }
              }}
              disabled={!selectedPlan}
              className={`
                px-6 py-2 rounded-lg transition-colors
                ${
                  selectedPlan
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              選択する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
