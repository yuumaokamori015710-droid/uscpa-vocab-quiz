"use client";

import { useEffect, useMemo, useState } from "react";
import { createOnboardingDeck, extractReadablePdfText } from "@/lib/onboardingQuizGenerator";
import type { OnboardingDeck, OnboardingQuestionAnswer } from "@/types";

type QuizMode = "setup" | "quiz" | "result";

const decksStorageKey = "skilldeck-onboarding-decks";
const answersStorageKey = "skilldeck-onboarding-answers";

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const readFileForDeck = async (file: File) => {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const buffer = await file.arrayBuffer();
    const raw = new TextDecoder("latin1").decode(buffer);
    return extractReadablePdfText(raw);
  }

  return file.text();
};

const loadJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function PdfDeckBuilder() {
  const [decks, setDecks] = useState<OnboardingDeck[]>([]);
  const [answers, setAnswers] = useState<OnboardingQuestionAnswer[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<QuizMode>("setup");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [deckTitle, setDeckTitle] = useState("New department onboarding");
  const [sourceName, setSourceName] = useState("Manual / PDF");
  const [sourceText, setSourceText] = useState("");
  const [uploadStatus, setUploadStatus] = useState("PDF or text fileを読み込むと、ここに抽出テキストが入ります。");
  const [quizQuestions, setQuizQuestions] = useState<OnboardingDeck["questions"]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [sessionAnswers, setSessionAnswers] = useState<OnboardingQuestionAnswer[]>([]);

  useEffect(() => {
    setDecks(loadJson<OnboardingDeck[]>(decksStorageKey, []));
    setAnswers(loadJson<OnboardingQuestionAnswer[]>(answersStorageKey, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(decksStorageKey, JSON.stringify(decks));
  }, [decks, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(answersStorageKey, JSON.stringify(answers));
  }, [answers, hydrated]);

  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0], [decks, selectedDeckId]);
  const current = quizQuestions[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === current?.correctAnswer;
  const isLast = index >= quizQuestions.length - 1;
  const sessionCorrect = sessionAnswers.filter((answer) => answer.isCorrect).length;

  const deckStats = useMemo(() => {
    return decks.map((deck) => {
      const deckQuestionIds = new Set(deck.questions.map((question) => question.id));
      const deckAnswers = answers.filter((answer) => deckQuestionIds.has(answer.questionId));
      const correct = deckAnswers.filter((answer) => answer.isCorrect).length;
      return {
        deckId: deck.id,
        answered: deckAnswers.length,
        accuracy: deckAnswers.length === 0 ? 0 : Math.round((correct / deckAnswers.length) * 100)
      };
    });
  }, [answers, decks]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setSourceName(file.name);
    setUploadStatus("ファイルを読み込んでいます...");
    const text = await readFileForDeck(file);
    const trimmed = text.trim();
    setSourceText(trimmed);
    setUploadStatus(
      trimmed.length >= 300
        ? `${file.name} から ${trimmed.length.toLocaleString()} 文字を抽出しました。`
        : "PDFの文字抽出が少なめです。スキャンPDFの場合は、下の欄にテキストを貼り付けて生成してください。"
    );
  };

  const generateDeck = () => {
    if (sourceText.trim().length < 120) {
      setUploadStatus("問題生成にはもう少し文章が必要です。PDFから取れない場合は本文を貼り付けてください。");
      return;
    }

    const deck = createOnboardingDeck({
      title: deckTitle,
      sourceName,
      sourceText
    });

    setDecks((currentDecks) => [deck, ...currentDecks]);
    setSelectedDeckId(deck.id);
    setMode("setup");
    setUploadStatus(`${deck.questions.length}問のオンボーディングデッキを生成しました。`);
  };

  const startQuiz = (deck: OnboardingDeck) => {
    const attempts = answers.reduce<Record<string, number>>((acc, answer) => {
      acc[answer.questionId] = (acc[answer.questionId] ?? 0) + 1;
      return acc;
    }, {});
    const nextQuestions = shuffle(deck.questions)
      .map((question) => ({ question, attempts: attempts[question.id] ?? 0 }))
      .sort((a, b) => a.attempts - b.attempts)
      .map((item) => item.question);

    setSelectedDeckId(deck.id);
    setQuizQuestions(nextQuestions);
    setIndex(0);
    setSelected(null);
    setSessionAnswers([]);
    setMode("quiz");
  };

  const choose = (choice: string) => {
    if (!current || selected) return;
    const answer = {
      questionId: current.id,
      isCorrect: choice === current.correctAnswer,
      answeredAt: new Date().toISOString()
    };
    setSelected(choice);
    setAnswers((items) => [...items, answer]);
    setSessionAnswers((items) => [...items, answer]);
  };

  const next = () => {
    if (isLast) {
      setMode("result");
      return;
    }
    setIndex((currentIndex) => currentIndex + 1);
    setSelected(null);
  };

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[24rem_1fr]">
      <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Deck Lab</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">PDFから業務クイズを作る</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          業務マニュアルや引き継ぎ資料を入れると、職務キャッチアップ用の4択デッキを作ります。
        </p>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Deck title
          <input
            value={deckTitle}
            onChange={(event) => setDeckTitle(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <label className="mt-4 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-4 text-center transition hover:border-[var(--accent)] hover:bg-[var(--hover)]">
          <span className="text-sm font-semibold text-[var(--text)]">PDF / TXT / MDを選択</span>
          <span className="mt-2 text-xs leading-5 text-[var(--muted)]">まずはブラウザ内で抽出します。データはこの端末のlocalStorageに保存されます。</span>
          <input type="file" accept=".pdf,.txt,.md,text/plain,application/pdf" onChange={(event) => handleFile(event.target.files?.[0] ?? null)} className="sr-only" />
        </label>

        <p className="mt-3 rounded-md bg-[var(--surface)] p-3 text-xs leading-5 text-[var(--muted)]">{uploadStatus}</p>

        <textarea
          value={sourceText}
          onChange={(event) => setSourceText(event.target.value)}
          placeholder="PDFからうまく抽出できない場合は、ここに資料本文を貼り付けてください。"
          className="mt-4 min-h-36 w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-sm leading-6 text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />

        <button onClick={generateDeck} className="mt-4 h-11 w-full rounded-md bg-[var(--accent)] text-sm font-semibold text-[var(--background)]">
          クイズデッキを生成
        </button>
      </aside>

      <div>
        {mode === "setup" ? (
          <div className="space-y-5">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Generated decks</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">オンボーディングデッキ</h3>
                </div>
                <p className="text-sm text-[var(--muted)]">{decks.length} decks</p>
              </div>

              <div className="mt-5 grid gap-3">
                {decks.length === 0 ? (
                  <div className="rounded-lg bg-[var(--surface)] p-5 text-sm leading-6 text-[var(--muted)]">
                    まだデッキがありません。左側からPDFかテキストを入れて、最初のキャッチアップクイズを作成してください。
                  </div>
                ) : null}

                {decks.map((deck) => {
                  const stats = deckStats.find((item) => item.deckId === deck.id);
                  return (
                    <button
                      key={deck.id}
                      onClick={() => startQuiz(deck)}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--hover)]"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-[var(--text)]">{deck.title}</h4>
                          <p className="mt-1 text-xs text-[var(--muted)]">{deck.sourceName}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <MiniMetric label="Questions" value={deck.questions.length} />
                          <MiniMetric label="Answered" value={stats?.answered ?? 0} />
                          <MiniMetric label="Accuracy" value={`${stats?.accuracy ?? 0}%`} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedDeck ? <DeckPreview deck={selectedDeck} /> : null}
          </div>
        ) : null}

        {mode === "quiz" && current ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge>{current.category}</Badge>
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
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--hover)]";

                return (
                  <button key={`${choice}-${choiceIndex}`} onClick={() => choose(choice)} className={`flex min-h-14 items-start gap-4 rounded-lg border px-4 py-3 text-left transition ${stateClass}`}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[var(--border)] text-sm font-semibold">{letter}</span>
                    <span className="text-sm font-medium leading-6">{choice}</span>
                  </button>
                );
              })}
            </div>

            {isAnswered ? (
              <div className={`mt-5 rounded-lg border p-4 ${isCorrect ? "border-[var(--correct)]/70 bg-[var(--correct)]/14" : "border-[var(--wrong)]/70 bg-[var(--wrong)]/14"}`}>
                <p className="text-lg font-semibold text-[var(--text)]">{isCorrect ? "正解" : "不正解"}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--subtle)]">{current.explanation}</p>
                <details className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">資料の根拠を見る</summary>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{current.sourceExcerpt}</p>
                </details>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setMode("setup")} className="h-11 rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[var(--subtle)] hover:bg-[var(--hover)]">
                デッキ一覧へ
              </button>
              <button onClick={next} disabled={!isAnswered} className="h-11 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-45">
                {isLast ? "結果を見る" : "次の問題へ"}
              </button>
            </div>
          </section>
        ) : null}

        {mode === "result" ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Result</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--text)]">{selectedDeck?.title}</h3>
            <div className="mx-auto mt-5 grid max-w-lg grid-cols-3 gap-3">
              <MiniMetric label="Answered" value={sessionAnswers.length} />
              <MiniMetric label="Correct" value={sessionCorrect} />
              <MiniMetric label="Accuracy" value={`${sessionAnswers.length === 0 ? 0 : Math.round((sessionCorrect / sessionAnswers.length) * 100)}%`} />
            </div>
            <button onClick={() => setMode("setup")} className="mt-6 h-11 rounded-md bg-[var(--accent)] px-6 text-sm font-semibold text-[var(--background)]">
              デッキ一覧へ戻る
            </button>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function DeckPreview({ deck }: { deck: OnboardingDeck }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Preview</p>
      <h3 className="mt-2 text-xl font-semibold text-[var(--text)]">{deck.title}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {deck.questions.slice(0, 4).map((question) => (
          <div key={question.id} className="rounded-lg bg-[var(--surface)] p-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{question.category}</Badge>
              <Badge>{question.topic}</Badge>
            </div>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--text)]">{question.question}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{question.keyTakeaway}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">{children}</span>;
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-[var(--card)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}
