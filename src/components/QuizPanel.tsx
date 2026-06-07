"use client";

import { useQuiz } from "@/hooks/useQuiz";
import { useLearningStore } from "@/store/useLearningStore";
import type { Subject, Word } from "@/types";

type QuizPanelProps = {
  subject: Subject | "Weak";
  words: Word[];
  allWords: Word[];
  onFinish: () => void;
  onCancel: () => void;
};

export function QuizPanel({ subject, words, allWords, onFinish, onCancel }: QuizPanelProps) {
  const { recordAnswer, finishSession } = useLearningStore();
  const quiz = useQuiz(words, allWords);

  if (!quiz.question) {
    return (
      <section className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8">
        <p className="text-lg font-semibold text-[var(--text)]">復習できる単語がありません。</p>
        <button onClick={onCancel} className="mt-6 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--background)]">
          Homeへ戻る
        </button>
      </section>
    );
  }

  const progress = `${quiz.index + 1} / ${words.length}`;

  const handleChoice = (meaning: string) => {
    if (quiz.isAnswered) return;
    quiz.select(meaning);
    recordAnswer(quiz.question, meaning === quiz.question.meaning);
  };

  const handleNext = () => {
    if (quiz.isLast) {
      finishSession(subject);
      onFinish();
      return;
    }
    quiz.next();
  };

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-md border border-[var(--accent)]/35 px-3 py-1 text-sm font-semibold text-[var(--accent)]">{subject}</span>
          <span className="text-sm text-[var(--muted)]">{progress}</span>
        </div>

        <div className="mt-10 border-b border-[var(--border)] pb-8">
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">Term</p>
          <h2 className="mt-3 text-4xl font-semibold text-[var(--text)] sm:text-5xl">{quiz.question.term}</h2>
        </div>

        <div className="mt-6 grid gap-3">
          {quiz.choices.map((choice, index) => {
            const letter = String.fromCharCode(65 + index);
            const isSelected = quiz.selectedMeaning === choice;
            const isAnswer = choice === quiz.question.meaning;
            const stateClass = quiz.isAnswered
              ? isAnswer
                ? "border-[var(--correct)] bg-[var(--correct)]/18 text-[var(--text)]"
                : isSelected
                  ? "border-[var(--wrong)] bg-[var(--wrong)]/18 text-[var(--text)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--hover)]";

            return (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                className={`flex min-h-14 items-center gap-4 rounded-lg border px-4 py-3 text-left transition ${stateClass}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--border)] text-sm font-semibold">{letter}</span>
                <span className="text-base font-medium">{choice}</span>
              </button>
            );
          })}
        </div>

        {quiz.isAnswered ? (
          <div className={`mt-6 rounded-lg border p-4 ${quiz.isCorrect ? "border-[#2E7D5B]/70 bg-[#2E7D5B]/14" : "border-[#8A2D2D]/70 bg-[#8A2D2D]/14"}`}>
            <p className="text-lg font-semibold text-[var(--text)]">{quiz.isCorrect ? "Correct" : "Wrong"}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--subtle)]">{quiz.question.explanation}</p>
          </div>
        ) : null}
      </div>

      <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Session</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
          <div className="h-full bg-[var(--accent)]" style={{ width: `${((quiz.index + 1) / words.length) * 100}%` }} />
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">正誤を確認してから次の問題へ進みます。</p>
        <button
          onClick={handleNext}
          disabled={!quiz.isAnswered}
          className="mt-6 h-11 w-full rounded-md bg-[var(--accent)] text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {quiz.isLast ? "結果を見る" : "次の問題へ"}
        </button>
        <button onClick={onCancel} className="mt-3 h-11 w-full rounded-md border border-[var(--border)] text-sm font-semibold text-[var(--subtle)] hover:bg-[var(--hover)]">
          中断する
        </button>
      </aside>
    </section>
  );
}
