"use client";

import { useLearningStore } from "@/store/useLearningStore";
import type { Word, WordStatus } from "@/types";

type WeakWordsPanelProps = {
  words: Word[];
  onReview: (words: Word[]) => void;
};

const statuses: WordStatus[] = ["New", "Learning", "Mastered"];

export function WeakWordsPanel({ words, onReview }: WeakWordsPanelProps) {
  const weakWords = useLearningStore((state) => state.weakWords);
  const markWeakWordStatus = useLearningStore((state) => state.markWeakWordStatus);
  const weakList = Object.values(weakWords)
    .map((weakWord) => ({ weakWord, word: words.find((word) => word.id === weakWord.wordId) }))
    .filter((item): item is { weakWord: NonNullable<typeof item.weakWord>; word: Word } => Boolean(item.word))
    .sort((a, b) => b.weakWord.mistakes - a.weakWord.mistakes);

  const reviewWords = weakList.filter((item) => item.weakWord.status !== "Mastered").map((item) => item.word);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">Weak Words</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">不正解だった単語を自動保存しています。</p>
        </div>
        <button
          onClick={() => onReview(reviewWords)}
          disabled={reviewWords.length === 0}
          className="h-11 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          苦手単語だけ再挑戦
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]">
        {weakList.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--muted)]">まだ苦手単語はありません。クイズで不正解になるとここに追加されます。</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {weakList.map(({ word, weakWord }) => (
              <div key={word.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-[var(--text)]">{word.term}</p>
                    <span className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{word.subject}</span>
                    <span className="text-xs text-[var(--muted)]">Mistakes {weakWord.mistakes}</span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--subtle)]">{word.meaning}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{word.explanation}</p>
                </div>
                <div className="flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => markWeakWordStatus(word.id, status)}
                      className={`h-9 rounded-md px-3 text-xs font-semibold ${
                        weakWord.status === status ? "bg-[var(--accent)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
