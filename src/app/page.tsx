"use client";

import { useEffect, useState } from "react";
import { Player } from "@/components/Player";
import { initializeStore } from "@/lib/stores/useAppStore";

export default function Home() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // ストアを初期化
    initializeStore().then(() => {
      setInitialized(true);
    });
  }, []);

  if (!initialized) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Pet Forever</h1>
          <p className="text-xl">読み込み中...</p>
        </div>
      </main>
    );
  }

  return <Player />;
}
