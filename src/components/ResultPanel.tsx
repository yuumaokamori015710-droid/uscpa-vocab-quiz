"use client";

import { useLearningStore } from "@/store/useLearningStore";

type ResultPanelProps = {
  onHome: () => void;
};

export function ResultPanel({ onHome }: ResultPanelProps) {
  const result = useLearningStore((state) => state.lastSessionResult);

  if (!result) return null;

  const rate = result.answered === 0 ? 0 : Math.round((result.correct / result.answered) * 100);

  return (
    <section className="mx-auto mt-10 max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Result</p>
      <h2 className="mt-3 text-3xl font-semibold text-[var(--text)]">{result.subjectLabel} Session</h2>
      <div className="mt-8 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)]">解答数</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{result.answered}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)]">正答数</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{result.correct}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)]">正答率</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{rate}%</p>
        </div>
      </div>
      <button onClick={onHome} className="mt-8 h-11 rounded-md bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--background)]">
        Homeへ戻る
      </button>
    </section>
  );
}
