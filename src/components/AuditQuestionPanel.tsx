"use client";

import { useMemo, useState } from "react";
import { useLearningStore } from "@/store/useLearningStore";
import type { Question, QuestionDifficulty, Subject } from "@/types";

type AuditQuestionPanelProps = {
  questions: Question[];
};

type Mode = "setup" | "quiz" | "result";

const difficulties: Array<QuestionDifficulty | "All"> = ["All", "Easy", "Medium", "Hard"];
const practiceSubjects: Subject[] = ["FAR", "AUD"];

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

export function AuditQuestionPanel({ questions }: AuditQuestionPanelProps) {
  const [mode, setMode] = useState<Mode>("setup");
  const [subject, setSubject] = useState<Subject>("FAR");
  const [category, setCategory] = useState("All");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | "All">("All");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewOnly, setReviewOnly] = useState(false);

  const getQuestionStats = useLearningStore((state) => state.getQuestionStats);
  const reviewQuestions = useLearningStore((state) => state.reviewQuestions);
  const recordQuestionAnswer = useLearningStore((state) => state.recordQuestionAnswer);
  const resetQuestionSession = useLearningStore((state) => state.resetQuestionSession);
  const finishQuestionSession = useLearningStore((state) => state.finishQuestionSession);
  const lastQuestionSessionResult = useLearningStore((state) => state.lastQuestionSessionResult);
  const markReviewQuestionMastered = useLearningStore((state) => state.markReviewQuestionMastered);
  const questionStats = getQuestionStats();

  const questionsBySubject = useMemo(() => {
    return practiceSubjects.reduce<Record<Subject, Question[]>>(
      (acc, nextSubject) => {
        acc[nextSubject] = questions.filter((question) => question.subject === nextSubject);
        return acc;
      },
      { FAR: [], AUD: [], REG: [], BAR: [] }
    );
  }, [questions]);

  const subjectQuestions = questionsBySubject[subject];

  const activeReviewIds = useMemo(() => {
    const subjectQuestionIds = new Set(subjectQuestions.map((question) => question.id));
    return new Set(
      Object.values(reviewQuestions)
        .filter((item) => !item.mastered && subjectQuestionIds.has(item.questionId))
        .map((item) => item.questionId)
    );
  }, [reviewQuestions, subjectQuestions]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(subjectQuestions.map((question) => question.category))).sort()];
  }, [subjectQuestions]);
  const topics = useMemo(() => {
    const source = category === "All" ? subjectQuestions : subjectQuestions.filter((question) => question.category === category);
    return ["All", ...Array.from(new Set(source.map((question) => question.topic))).sort()];
  }, [category, subjectQuestions]);

  const filteredQuestions = useMemo(() => {
    return subjectQuestions.filter((question) => {
      return (
        (category === "All" || question.category === category) &&
        (topic === "All" || question.topic === topic) &&
        (difficulty === "All" || question.difficulty === difficulty)
      );
    });
  }, [category, difficulty, subjectQuestions, topic]);

  const current = quizQuestions[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === current?.correctAnswer;
  const isLast = index >= quizQuestions.length - 1;
  const reviewCount = activeReviewIds.size;

  const startQuiz = (useReviewOnly: boolean) => {
    const source = filteredQuestions.filter((question) => !useReviewOnly || activeReviewIds.has(question.id));
    const nextQuestions = shuffle(source).slice(0, 20);
    resetQuestionSession();
    setReviewOnly(useReviewOnly);
    setQuizQuestions(nextQuestions);
    setIndex(0);
    setSelected(null);
    setMode("quiz");
  };

  const choose = (choice: string) => {
    if (isAnswered || !current) return;
    setSelected(choice);
    recordQuestionAnswer(current, choice === current.correctAnswer);
  };

  const next = () => {
    if (isLast) {
      finishQuestionSession(reviewOnly ? `${subject} Review Questions` : `${subject} Questions`);
      setMode("result");
      return;
    }
    setIndex((currentIndex) => currentIndex + 1);
    setSelected(null);
  };

  return (
    <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">USCPA MCQ Practice</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">FAR / AUD 問題演習</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            科目を明示的に分けて演習します。問題は既存教材のコピーではなく、論点・試験テクニックを練習するためのオリジナル4択です。
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[20rem]">
          <MiniStat label="Today" value={questionStats.todayAnswered} />
          <MiniStat label="Week" value={questionStats.weeklyAnswered} />
          <MiniStat label="Review" value={reviewCount} />
        </div>
      </div>

      {mode === "setup" ? (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {practiceSubjects.map((nextSubject) => (
              <button
                key={nextSubject}
                onClick={() => {
                  setSubject(nextSubject);
                  setCategory("All");
                  setTopic("All");
                }}
                className={`rounded-lg border p-4 text-left transition ${
                  subject === nextSubject
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--hover)]"
                }`}
              >
                <span className="text-2xl font-semibold text-[var(--text)]">{nextSubject}</span>
                <span className="ml-3 text-sm text-[var(--muted)]">{questionsBySubject[nextSubject].length}問</span>
                <span className="mt-2 block text-sm text-[var(--muted)]">
                  {nextSubject === "FAR" ? "会計処理・表示・測定の論点" : "監査手続・報告・内部統制の論点"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <FilterSelect label="Category" value={category} values={categories} onChange={(value) => { setCategory(value); setTopic("All"); }} />
            <FilterSelect label="Topic" value={topic} values={topics} onChange={setTopic} />
            <FilterSelect label="Difficulty" value={difficulty} values={difficulties} onChange={(value) => setDifficulty(value as QuestionDifficulty | "All")} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div className="rounded-lg bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
              {subject} 条件に合う問題: <span className="font-semibold text-[var(--text)]">{filteredQuestions.length}</span> / {subjectQuestions.length}問
            </div>
            <button
              onClick={() => startQuiz(false)}
              disabled={filteredQuestions.length === 0}
              className="h-11 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {subject}問題を開始
            </button>
            <button
              onClick={() => startQuiz(true)}
              disabled={reviewCount === 0}
              className="h-11 rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              復習だけ解く
            </button>
          </div>
        </>
      ) : null}

      {mode === "quiz" && current ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem] lg:gap-6">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{current.category}</Badge>
                <Badge>{current.subject}</Badge>
                <Badge>{current.topic}</Badge>
                <Badge>{current.difficulty}</Badge>
              </div>
              <p className="text-sm text-[var(--muted)]">{index + 1} / {quizQuestions.length}</p>
            </div>

            <h3 className="mt-6 text-xl font-semibold leading-8 text-[var(--text)]">{current.question}</h3>

            <div className="mt-5 grid gap-3">
              {current.choices.map((choice, choiceIndex) => {
                const letter = String.fromCharCode(65 + choiceIndex);
                const isChoiceCorrect = choice === current.correctAnswer;
                const isSelected = choice === selected;
                const stateClass = isAnswered
                  ? isChoiceCorrect
                    ? "border-[var(--correct)] bg-[var(--correct)]/18 text-[var(--text)]"
                    : isSelected
                      ? "border-[var(--wrong)] bg-[var(--wrong)]/18 text-[var(--text)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--hover)]";

                return (
                  <button key={choice} onClick={() => choose(choice)} className={`flex min-h-14 items-center gap-4 rounded-lg border px-4 py-3 text-left transition ${stateClass}`}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--border)] text-sm font-semibold">{letter}</span>
                    <span className="text-sm font-medium leading-6">{choice}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered ? (
              <div className={`mt-5 rounded-lg border p-4 ${isCorrect ? "border-[var(--correct)]/70 bg-[var(--correct)]/14" : "border-[var(--wrong)]/70 bg-[var(--wrong)]/14"}`}>
                <p className="text-lg font-semibold text-[var(--text)]">{isCorrect ? "Correct" : "Wrong"}</p>
                <div className="mt-3 rounded-md bg-[var(--card)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">試験のポイント</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">{current.examTechnique ?? current.keyTakeaway}</p>
                  {current.examTechnique && current.examTechnique !== current.keyTakeaway ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{current.keyTakeaway}</p>
                  ) : null}
                </div>
                <details className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">詳細解説を開く</summary>
                  <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--muted)]">
                    <section>
                      <p className="font-semibold text-[var(--text)]">解説</p>
                      <p className="mt-1 whitespace-pre-line">{current.explanationJa}</p>
                    </section>
                    <section>
                      <p className="font-semibold text-[var(--text)]">選択肢の見方</p>
                      <ul className="mt-1 space-y-1">
                        {current.choices.map((choice) => (
                          <li key={choice} className={choice === current.correctAnswer ? "text-[var(--correct)]" : choice === selected ? "text-[var(--wrong)]" : ""}>
                            {choice === current.correctAnswer ? "正解: " : choice === selected ? "選択: " : ""}
                            {choice}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <p className="font-semibold text-[var(--text)]">ひっかけポイント</p>
                      <p className="mt-1">{current.trapExplanation}</p>
                    </section>
                  </div>
                </details>
                {current.relatedTopics?.length ? (
                  <p className="mt-3 text-xs text-[var(--muted)]">Related: {current.relatedTopics.join(" / ")}</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Session</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--card)]">
              <div className="h-full bg-[var(--accent)]" style={{ width: `${((index + 1) / quizQuestions.length) * 100}%` }} />
            </div>
            <button
              onClick={next}
              disabled={!isAnswered}
              className="mt-6 h-11 w-full rounded-md bg-[var(--accent)] text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLast ? "結果を見る" : "次の問題へ"}
            </button>
            <button onClick={() => setMode("setup")} className="mt-3 h-11 w-full rounded-md border border-[var(--border)] text-sm font-semibold text-[var(--subtle)] hover:bg-[var(--hover)]">
              条件選択へ戻る
            </button>
            {reviewQuestions[current.id] ? (
              <button onClick={() => markReviewQuestionMastered(current.id, true)} className="mt-3 h-11 w-full rounded-md border border-[var(--border)] text-sm font-semibold text-[var(--subtle)] hover:bg-[var(--hover)]">
                復習済みにする
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}

      {mode === "result" ? (
        <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Result</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">{lastQuestionSessionResult?.subjectLabel}</h3>
          <div className="mx-auto mt-5 grid max-w-xl grid-cols-3 gap-3">
            <MiniStat label="Answered" value={lastQuestionSessionResult?.answered ?? 0} />
            <MiniStat label="Correct" value={lastQuestionSessionResult?.correct ?? 0} />
            <MiniStat
              label="Accuracy"
              value={`${lastQuestionSessionResult?.answered ? Math.round(((lastQuestionSessionResult.correct ?? 0) / lastQuestionSessionResult.answered) * 100) : 0}%`}
            />
          </div>
          <button onClick={() => setMode("setup")} className="mt-6 h-11 rounded-md bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--background)]">
            問題選択へ戻る
          </button>
        </div>
      ) : null}
    </section>
  );
}

function FilterSelect({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
      >
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{children}</span>;
}
