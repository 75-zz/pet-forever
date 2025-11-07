/**
 * 重み付きシャッフルキュー
 * @template T アイテムの型
 */
export class ShuffleQueue<T> {
  private items: T[];
  private weights: Map<T, number>;

  constructor(items: T[] = [], weights?: Map<T, number>) {
    this.items = [...items];
    this.weights = weights || new Map();
  }

  /**
   * アイテムを追加
   */
  add(item: T, weight: number = 1.0): void {
    this.items.push(item);
    this.weights.set(item, weight);
  }

  /**
   * アイテムのリストを設定
   */
  setItems(items: T[], weights?: Map<T, number>): void {
    this.items = [...items];
    this.weights = weights || new Map();

    // weightsが指定されていない場合は、すべて1.0に設定
    if (!weights) {
      this.items.forEach((item) => {
        if (!this.weights.has(item)) {
          this.weights.set(item, 1.0);
        }
      });
    }
  }

  /**
   * 重み付きランダム選択
   */
  pickWeighted(): T | null {
    if (this.items.length === 0) return null;

    // 累積重みを計算
    const cumulativeWeights: number[] = [];
    let sum = 0;

    for (const item of this.items) {
      const weight = this.weights.get(item) || 1.0;
      sum += weight;
      cumulativeWeights.push(sum);
    }

    // ランダム値で選択
    const random = Math.random() * sum;
    const index = cumulativeWeights.findIndex((w) => random <= w);

    return this.items[index] || this.items[0];
  }

  /**
   * 単純ランダム選択
   */
  pickRandom(): T | null {
    if (this.items.length === 0) return null;
    const index = Math.floor(Math.random() * this.items.length);
    return this.items[index];
  }

  /**
   * アイテムを削除
   */
  remove(item: T): void {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      this.weights.delete(item);
    }
  }

  /**
   * 重みを更新
   */
  updateWeight(item: T, weight: number): void {
    this.weights.set(item, weight);
  }

  /**
   * すべてのアイテムを取得
   */
  getItems(): T[] {
    return [...this.items];
  }

  /**
   * アイテム数を取得
   */
  size(): number {
    return this.items.length;
  }

  /**
   * すべてクリア
   */
  clear(): void {
    this.items = [];
    this.weights.clear();
  }

  /**
   * シャッフル（Fisher-Yates）
   */
  shuffle(): void {
    for (let i = this.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
  }
}
