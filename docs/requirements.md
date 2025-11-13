# Pet Forever - 要件定義書

## 1. プロジェクト概要

### 1.1 プロジェクト名
**Pet Forever（ペット・フォーエバー）**

### 1.2 プロジェクトの目的
亡くなった愛犬の思い出を毎日振り返るためのメモリアル動画カレンダーWebアプリケーション。
ユーザーがアップロードした画像と動画を自動的に組み合わせて再生し、日々の生活の中で大切なペットの思い出を身近に感じられるようにする。

### 1.3 ターゲットユーザー
- ペット（主に犬）を亡くした飼い主
- ペットの思い出を大切に保存・振り返りたい人
- デジタルメモリアルを求める人

### 1.4 主要な価値提案
- **完全ローカル動作**: すべてのデータはブラウザ内に保存され、クラウド不要
- **自動化された思い出の再生**: 手動操作なしで毎週・毎日自動的に思い出を表示
- **多様性のある表示**: 同じ画像ばかりでなく、バランスよく様々な思い出を表示
- **カスタマイズ可能**: 表示時間、アニメーション、カレンダーなど細かく設定可能
- **PWA対応**: インストール可能、オフラインでも動作

---

## 2. 機能要件

### 2.1 メディア管理機能

#### 2.1.1 画像管理
- **画像アップロード**
  - 対応形式: JPEG, PNG, GIF, WebP
  - 複数ファイル同時アップロード対応
  - ファイル名の保存
- **画像メタデータ管理**
  - ID（UUID）
  - ファイル名
  - タグ（複数設定可能）
  - 撮影日時（オプション）
  - 重み（希少度、デフォルト1.0）
  - 表示回数
- **画像操作**
  - タグの追加・編集
  - 画像の削除
  - 画像のプレビュー

#### 2.1.2 動画管理
- **動画アップロード**
  - 対応形式: MP4, WebM, OGV
  - ファイル名の保存
- **動画メタデータ管理**
  - ID（UUID）
  - ファイル名
  - ラベル（第1週、第2週など）
  - 週番号（1-4）
- **週次割り当て**
  - 各動画を特定の週（第1週〜第4週）に割り当て
  - 1つの動画を複数の週に割り当て可能
  - 週に動画が割り当てられていない場合の処理
- **動画操作**
  - 週番号の変更
  - 動画の削除
  - 動画のプレビュー

### 2.2 再生機能

#### 2.2.1 再生シーケンス
- **基本サイクル**: 動画 → 画像 → 画像 → 画像 → 動画（ループ）
- **動画再生**
  - 現在の週（第1〜4週）に割り当てられた動画を自動選択
  - 動画の実際の長さ（duration）を取得して全編再生
  - 動画が1つしかない場合は週が変わっても同じ動画を継続表示
  - 音量調整対応
  - フルスクリーン表示（object-cover）
- **画像再生**
  - DiversityPickerアルゴリズムによる画像選択
  - 2枚の画像を左右に配置
  - 上から下への緩やかなアニメーション（0% → 4%の移動）
  - フルスクリーン表示（object-cover）
  - 画像は110%（1.1倍）に拡大して表示（移動時の空白防止）
  - 設定された表示時間後に次の画像に切り替え

#### 2.2.2 トランジション効果
- **フェード効果**
  - 動画 → 画像: フェードイン/アウト
  - 画像 → 動画: フェードイン/アウト
  - 画像 → 画像: フェードなし（スムーズな切り替え）
- **フェード時間**
  - フェードイン: 0.5〜3秒（設定可能）
  - フェードアウト: 0.5〜3秒（設定可能）

#### 2.2.3 再生コントロール
- **再生/一時停止**
  - スペースキーで切り替え
  - 画面下部のボタンで操作
- **全画面表示**
  - Fキーで切り替え
- **自動再生**
  - ページ読み込み時に自動開始

### 2.3 カレンダー表示機能

#### 2.3.1 表示モード
- **1日表示**
  - 今日の日付を大きく表示（text-9xl）
  - 曜日表示（text-6xl）
  - 年表示（オプション）
  - 記念日表示（該当日のみ）
- **1か月表示**
  - カレンダーグリッド表示
  - 今日の日付を強調表示（scale-110, bg-white/30）
  - 曜日ヘッダー
  - 月・年の表示（text-5xl）
  - グラスモーフィズム背景（bg-white/20 backdrop-blur-md）

#### 2.3.2 カスタマイズ
- **表示/非表示**: トグルで切り替え可能
- **位置**: 4箇所から選択
  - 左上（top-left）
  - 右上（top-right）
  - 左下（bottom-left）
  - 右下（bottom-right）
- **フォント**: 7種類のGoogleフォントから選択
  - Roboto（デフォルト）
  - Montserrat
  - Questrial
  - Anton
  - Lato
  - Cormorant Garamond
  - Libre Baskerville
- **文字色**: カラーピッカーで自由に選択（デフォルト: #000000）
- **文字サイズ**: 3段階
  - 小（small）
  - 中（medium、デフォルト）
  - 大（large）
- **週の開始曜日**: 日曜/月曜から選択
- **言語**: 日本語/英語

#### 2.3.3 記念日機能
- 記念日の登録（日付、ラベル、アイコン、色）
- 該当日にカレンダーに表示

### 2.4 設定機能

#### 2.4.1 基本設定
- **言語設定**: 日本語/英語
  - UI言語の切り替え
  - カレンダーの言語切り替え

#### 2.4.2 カレンダー設定
- 表示モード（1日/1か月）
- 位置（4箇所）
- 表示/非表示
- 年表示のON/OFF
- 曜日表示のON/OFF
- 週の開始曜日
- フォント選択
- 文字色
- 文字サイズ

#### 2.4.3 メディア設定
- **画像表示時間**: 3〜15秒（デフォルト: 7秒）
- **フェードイン時間**: 0.5〜3秒（デフォルト: 1秒）
- **フェードアウト時間**: 0.5〜3秒（デフォルト: 1秒）
- **アニメーション速度**: 0.5〜2倍速（デフォルト: 1.0）
- **音量**: 0〜100%（デフォルト: 50%）
- **音声ON/OFF**: トグル

#### 2.4.4 多様性設定
- **履歴ウィンドウ**: 直近何枚を除外するか（デフォルト: 20）
- **タグ分散レベル**: low / medium / high
- **希少度ブースト係数**: デフォルト1.5

### 2.5 データ永続化機能
- **IndexedDB使用**
  - すべてのデータをローカルに保存
  - 設定、画像、動画、週次スケジュール、再生状態
- **データのインポート/エクスポート**（将来実装予定）
- **データリセット機能**
  - すべてのデータを削除

---

## 3. 非機能要件

### 3.1 パフォーマンス要件
- ページ読み込み時間: 3秒以内
- 画像切り替え: 遅延なくスムーズに
- メディアアップロード: 10MB以下の画像/動画は5秒以内

### 3.2 ユーザビリティ要件
- 直感的なUI（ハンバーガーメニュー、明確なボタン）
- キーボードショートカット対応（スペース、F）
- レスポンシブデザイン（デスクトップ、タブレット対応）

### 3.3 互換性要件
- **ブラウザ対応**
  - Chrome（推奨）
  - Firefox
  - Edge
  - Safari
- **デバイス対応**
  - デスクトップ（Windows, Mac, Linux）
  - タブレット
  - スマートフォン（制限付き）

### 3.4 セキュリティ・プライバシー要件
- **完全ローカル動作**: 外部サーバーへのデータ送信なし
- **データ保存**: ブラウザのIndexedDBのみ使用
- **プライバシー保護**: ユーザーデータは端末内のみに保存

### 3.5 可用性要件
- **オフライン動作**: PWA対応によりインターネット接続不要
- **データ永続性**: ブラウザのキャッシュクリアまでデータ保持

---

## 4. 技術スタック

### 4.1 フロントエンド
- **フレームワーク**: Next.js 14（App Router）
- **言語**: TypeScript 5
- **UIライブラリ**: React 18
- **スタイリング**: Tailwind CSS 3.4

### 4.2 状態管理
- **Zustand 4.5**: グローバル状態管理

### 4.3 データ永続化
- **idb 8.0**: IndexedDBラッパー

### 4.4 ユーティリティ
- **date-fns 3.3**: 日付処理

### 4.5 開発環境
- **Node.js**: 20以上
- **パッケージマネージャー**: npm
- **Linter**: ESLint
- **Formatter**: Next.js標準設定

---

## 5. アーキテクチャ設計

### 5.1 アーキテクチャパターン
- **MVC + サービス層**
  - Model: TypeScript型定義（src/lib/types/）
  - View: Reactコンポーネント（src/components/）
  - Controller: カスタムフック + Zustandストア
  - Service: ビジネスロジック（src/lib/services/）

### 5.2 レイヤー構造

```
┌─────────────────────────────────────┐
│   Presentation Layer (Components)   │  ← React Components
├─────────────────────────────────────┤
│   State Management (Zustand)        │  ← useAppStore
├─────────────────────────────────────┤
│   Business Logic (Services)         │  ← OOPクラス
│   - CalendarService                 │
│   - WeeklyVideoScheduler            │
│   - DiversityPicker                 │
│   - ShuffleQueue                    │
│   - RoundConductor                  │
├─────────────────────────────────────┤
│   Data Access Layer (StorageRepo)   │  ← IndexedDB操作
├─────────────────────────────────────┤
│   Storage (IndexedDB)               │  ← ブラウザストレージ
└─────────────────────────────────────┘
```

### 5.3 主要サービスクラス

#### 5.3.1 CalendarService
- **責務**: 日付計算、カレンダー表示ロジック
- **主要メソッド**:
  - 今日の日付取得
  - 週番号計算
  - カレンダーグリッド生成
  - 記念日判定

#### 5.3.2 WeeklyVideoScheduler
- **責務**: 週次動画スケジュール管理
- **主要メソッド**:
  - 現在の週番号取得
  - 週に対応する動画ID取得
  - 週次スケジュールの更新

#### 5.3.3 DiversityPicker
- **責務**: 画像の多様性を保つ選択アルゴリズム
- **主要メソッド**:
  - 次の画像を選択（履歴・タグ・希少度を考慮）
  - 履歴の更新
  - タグ分散の計算
- **アルゴリズム**:
  1. 直近K枚（historyWindow）の画像を除外
  2. タグの出現頻度を計算
  3. 希少度（weight）でブースト
  4. 重み付きランダム選択

#### 5.3.4 ShuffleQueue
- **責務**: 重み付きシャッフルキュー
- **主要メソッド**:
  - 重み付きランダム選択
  - キューの更新

#### 5.3.5 RoundConductor
- **責務**: 再生シーケンス管理
- **主要メソッド**:
  - 次のラウンド決定（video / image）
  - 動画選択
  - 画像選択（DiversityPicker利用）
- **ロジック**:
  - imageSlotIndex（0-2）を管理
  - 0の場合: video
  - 1-3の場合: image
  - 3の次は0に戻る（ループ）

#### 5.3.6 StorageRepo
- **責務**: IndexedDBとの読み書き
- **主要メソッド**:
  - 設定の保存・読み込み
  - 画像の保存・読み込み・削除
  - 動画の保存・読み込み・削除
  - 週次スケジュールの保存・読み込み
  - すべてのデータ削除

### 5.4 データフロー

```
User Action
    ↓
React Component
    ↓
Zustand Action (useAppStore)
    ↓
Service Layer (Business Logic)
    ↓
StorageRepo (Data Access)
    ↓
IndexedDB (Persistence)
    ↓
Zustand State Update
    ↓
React Component Re-render
```

---

## 6. データモデル

### 6.1 型定義（TypeScript）

#### 6.1.1 ImageItem
```typescript
interface ImageItem {
  id: string;              // UUID
  src: string;             // Data URL or Blob URL
  fileName?: string;       // ファイル名
  tags?: string[];         // タグ配列
  takenAt?: string;        // ISO 8601日付文字列
  weight?: number;         // 希少度重み（デフォルト1.0）
  displayCount?: number;   // 表示回数
}
```

#### 6.1.2 VideoItem
```typescript
interface VideoItem {
  id: string;              // UUID
  src: string;             // Data URL or Blob URL
  fileName?: string;       // ファイル名
  label?: string;          // 第1週、第2週など
  weekNumber?: number;     // 1-4
}
```

#### 6.1.3 AppSettings
```typescript
interface AppSettings {
  locale: Locale;                      // 'ja' | 'en'
  calendar: CalendarSettings;
  media: MediaSettings;
  diversity: DiversitySettings;
  anniversaries: Anniversary[];
}
```

#### 6.1.4 CalendarSettings
```typescript
interface CalendarSettings {
  mode: CalendarMode;                  // 'day' | 'month'
  position: CalendarPosition;          // 4箇所
  showYear: boolean;
  showWeekday: boolean;
  weekStart: WeekStart;                // 'sun' | 'mon'
  locale: Locale;                      // 'ja' | 'en'
  visible: boolean;
  font: CalendarFont;                  // 7種類のフォント
  textColor: string;                   // hex color
  size: CalendarSize;                  // 'small' | 'medium' | 'large'
}
```

#### 6.1.5 MediaSettings
```typescript
interface MediaSettings {
  videoSeconds: {
    min: number;
    max: number;
    fixed?: number;
  };
  imageSlots: number;                  // 2-4（現在3固定）
  imageDuration: number;               // 秒
  randomRotation: boolean;
  randomPosition: boolean;
  randomScale: boolean;
  audioEnabled: boolean;
  audioVolume: number;                 // 0-100
  fadeInDuration: number;              // 秒
  fadeOutDuration: number;             // 秒
  animationSpeed: number;              // 0.5-2.0
}
```

#### 6.1.6 DiversitySettings
```typescript
interface DiversitySettings {
  historyWindow: number;               // デフォルト20
  tagSeparation: TagSeparation;        // 'low' | 'medium' | 'high'
  rarityBoost: number;                 // デフォルト1.5
}
```

#### 6.1.7 PlaybackState
```typescript
interface PlaybackState {
  isPlaying: boolean;
  currentRound: 'video' | 'image';
  currentVideoId?: string;
  currentVideoDuration?: number;
  currentImages?: {
    item: ImageItem;
    props: ImageDisplayProps;
  }[];
  imageSlotIndex: number;              // 0-3
}
```

#### 6.1.8 WeeklySchedule
```typescript
interface WeeklySchedule {
  [weekNumber: number]: string;        // weekNumber -> videoId
}
```

### 6.2 IndexedDBスキーマ

**データベース名**: `pet-forever-db`

**ストア**:
- `settings`: AppSettings
- `images`: ImageItem[]
- `videos`: VideoItem[]
- `weeklySchedule`: WeeklySchedule
- `playback`: PlaybackState（オプション）

---

## 7. コンポーネント設計

### 7.1 コンポーネント構成

```
src/
├── app/
│   ├── layout.tsx           # ルートレイアウト（フォント読み込み）
│   └── page.tsx             # トップページ（Playerコンポーネント表示）
├── components/
│   ├── Player.tsx           # メインプレーヤー画面
│   ├── MediaPlayer.tsx      # 動画・画像表示
│   ├── Calendar.tsx         # カレンダー表示
│   ├── Settings.tsx         # 設定画面
│   └── MediaLibrary.tsx     # メディアライブラリ
```

### 7.2 主要コンポーネント

#### 7.2.1 Player.tsx
- **役割**: メインプレーヤー画面の統括
- **主要機能**:
  - MediaPlayer、Calendar、UIコントロールの配置
  - 再生タイマー管理
  - 再生/一時停止制御
  - ハンバーガーメニュー表示
  - キーボードショートカット（スペース、F）
- **状態管理**: useAppStore経由でPlaybackStateを管理
- **レイヤー（Z-index）**:
  - 背景: z-0
  - メディア（MediaPlayer）: z-10
  - カレンダー: z-100
  - コントロールUI: z-200

#### 7.2.2 MediaPlayer.tsx
- **役割**: 動画・画像の表示とアニメーション
- **主要機能**:
  - 動画再生（VideoPlayer内部コンポーネント）
  - 画像表示（ImageDisplay内部コンポーネント）
  - フェードイン/アウト制御
  - アニメーション速度制御
- **内部コンポーネント**:
  - VideoPlayer: video要素のラッパー、duration取得
  - ImageDisplay: 2枚の画像を左右配置、上下アニメーション

#### 7.2.3 Calendar.tsx
- **役割**: カレンダー表示
- **主要機能**:
  - 1日表示（DayCalendar）
  - 1か月表示（MonthCalendar）
  - フォント動的適用
  - 文字色・サイズ動的適用
  - 位置調整
- **内部コンポーネント**:
  - DayCalendar: 今日の日付を大きく表示
  - MonthCalendar: カレンダーグリッド表示

#### 7.2.4 Settings.tsx
- **役割**: 設定画面
- **主要機能**:
  - 基本設定（言語）
  - カレンダー設定（モード、位置、フォント、色、サイズ等）
  - メディア設定（表示時間、フェード、音量等）
  - 多様性設定
  - 記念日設定
  - データリセット
- **UI**: スライダー、ラジオボタン、カラーピッカー、トグル

#### 7.2.5 MediaLibrary.tsx
- **役割**: メディアライブラリ管理
- **主要機能**:
  - 画像アップロード（複数対応）
  - 動画アップロード
  - 画像一覧表示（サムネイル、タグ表示）
  - 動画一覧表示（週番号表示）
  - タグ編集
  - 週番号割り当て
  - メディア削除
- **UI**: グリッドレイアウト、モーダル

---

## 8. UI/UX設計

### 8.1 デザインシステム

#### 8.1.1 カラーパレット
- **背景**: 白（#FFFFFF）
- **テキスト**: グレー〜黒（Tailwind CSS標準）
- **カレンダー文字**: ユーザー設定可能（デフォルト: #000000）
- **アクセント**: Tailwind CSS標準色

#### 8.1.2 タイポグラフィ
- **カレンダーフォント**: 7種類のGoogleフォント
- **UIフォント**: システムデフォルト

#### 8.1.3 スペーシング
- Tailwind CSSのスペーシングスケール使用

#### 8.1.4 レイヤー（Z-index）
| Z-index | レイヤー |
|---------|---------|
| 200 | コントロールUI |
| 100 | カレンダー |
| 10 | メディア |
| 0 | 背景 |

### 8.2 インタラクション

#### 8.2.1 キーボードショートカット
- **スペース**: 再生/一時停止
- **F**: 全画面切り替え

#### 8.2.2 ボタン・コントロール
- **再生/停止ボタン**: 画面下部中央、控えめなデザイン（px-4 py-2）
- **ハンバーガーメニュー**: 右上、メニュー外クリックで閉じる
- **設定・メディアライブラリ**: ハンバーガーメニュー内

#### 8.2.3 フィードバック
- ボタンホバー時のスタイル変化
- ローディング表示（該当する場合）

### 8.3 レスポンシブデザイン
- **デスクトップ**: フル機能
- **タブレット**: フル機能（タッチ対応）
- **スマートフォン**: 基本機能（画面サイズに応じた調整）

---

## 9. 開発ガイドライン

### 9.1 コーディング規約
- **TypeScript**: 型安全性を最大限活用
- **コンポーネント**: 関数コンポーネント + Hooks
- **命名規則**:
  - コンポーネント: PascalCase
  - 関数・変数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型・インターフェース: PascalCase

### 9.2 ディレクトリ構造
```
pet-forever/
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # Reactコンポーネント
│   ├── lib/
│   │   ├── services/         # ビジネスロジック（OOP）
│   │   ├── stores/           # Zustand状態管理
│   │   ├── db/               # IndexedDB
│   │   ├── types/            # 型定義
│   │   └── utils/            # ユーティリティ
│   └── styles/               # グローバルスタイル
├── public/                   # 静的ファイル
├── docs/                     # ドキュメント
└── [設定ファイル]
```

### 9.3 状態管理パターン
- **グローバル状態**: Zustand（useAppStore）
- **ローカル状態**: useState
- **副作用**: useEffect
- **メモ化**: useMemo, useCallback（必要時）

### 9.4 データ永続化パターン
- **保存**: ユーザーアクション時に自動保存
- **読み込み**: アプリ起動時に自動読み込み
- **マージ**: 既存データと新規プロパティのディープマージ（`mergeSettings`）

---

## 10. テスト戦略（将来実装）

### 10.1 単体テスト
- サービスクラスのロジックテスト
- ユーティリティ関数のテスト

### 10.2 統合テスト
- コンポーネント間の連携テスト
- IndexedDB操作のテスト

### 10.3 E2Eテスト
- ユーザーフロー全体のテスト

---

## 11. デプロイメント

### 11.1 ビルド
```bash
npm run build
```

### 11.2 デプロイ先
- **Vercel**（推奨）: vercel.jsonで設定済み
- **Netlify**
- **静的ホスティング**

### 11.3 PWA対応
- Service Workerによるオフライン動作
- manifest.jsonによるインストール対応

---

## 12. 今後の拡張予定

### 12.1 短期（v0.3.x）
- [ ] メディアエクスポート機能
- [ ] データバックアップ/リストア機能
- [ ] 記念日の特別演出

### 12.2 中期（v0.4.x - v0.5.x）
- [ ] BGM追加機能
- [ ] 複数ペット対応
- [ ] テーマカスタマイズ

### 12.3 長期（v1.0.x以降）
- [ ] Google Photos連携
- [ ] 顔検出による自動フレーミング
- [ ] シェア用ショートクリップ生成
- [ ] クラウド同期（オプション）

---

## 13. 制約事項・既知の問題

### 13.1 技術的制約
- **ブラウザストレージ制限**: IndexedDBの容量制限あり（通常数GB）
- **メディアファイルサイズ**: 大容量ファイルはパフォーマンスに影響

### 13.2 既知の問題
- （現時点でなし）

---

## 14. 用語集

| 用語 | 説明 |
|------|------|
| メモリアルアプリ | 故人やペットの思い出を保存・表示するアプリ |
| IndexedDB | ブラウザ内の構造化データベース |
| PWA | Progressive Web App（インストール可能なWebアプリ） |
| DiversityPicker | 画像の多様性を保つ選択アルゴリズム |
| RoundConductor | 動画・画像の再生シーケンスを管理するクラス |
| 週次スケジュール | 第1〜4週に動画を割り当てるスケジュール |
| フェード | 画面の切り替え効果（徐々に表示/非表示） |
| グラスモーフィズム | 半透明でぼかしのあるUIデザイン |

---

## 15. 参考資料

- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Zustand公式ドキュメント](https://zustand-demo.pmnd.rs/)
- [IndexedDB API - MDN](https://developer.mozilla.org/ja/docs/Web/API/IndexedDB_API)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs)
- [date-fns公式ドキュメント](https://date-fns.org/)

---

**文書バージョン**: 1.0  
**作成日**: 2025-11-10  
**最終更新**: 2025-11-10  
**作成者**: Claude (AI Assistant)
