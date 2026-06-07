"use client";

import { useLearningStore } from "@/store/useLearningStore";

export function SettingsPanel() {
  const theme = useLearningStore((state) => state.theme);
  const setTheme = useLearningStore((state) => state.setTheme);

  return (
    <section className="mt-8 max-w-3xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Settings</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">表示設定</h2>
      <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[var(--text)]">カラーモード</p>
            <p className="mt-1 text-sm text-[var(--muted)]">学習しやすい表示に切り替えます。</p>
          </div>
          <div className="grid grid-cols-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1">
            {(["dark", "light"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`h-10 rounded-md px-5 text-sm font-semibold transition ${
                  theme === mode ? "bg-[var(--accent)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                {mode === "dark" ? "Dark" : "White"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
