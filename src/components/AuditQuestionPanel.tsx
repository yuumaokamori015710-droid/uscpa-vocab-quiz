"use client";

import { useMemo, useState } from "react";
import { useLearningStore } from "@/store/useLearningStore";
import type { Question, QuestionDifficulty, QuestionType, Subject } from "@/types";

type AuditQuestionPanelProps = {
  questions: Question[];
};

type Mode = "setup" | "quiz" | "result";

const difficulties: Array<QuestionDifficulty | "All"> = ["All", "Easy", "Medium", "Hard"];
const questionTypes: Array<QuestionType | "All"> = ["All", "calculation", "theory"];
const practiceSubjects: Subject[] = ["FAR", "AUD"];

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const prioritizeQuestionsByFewestAttempts = (items: Question[], answers: Array<{ questionId: string }>) => {
  const attempts = answers.reduce<Record<string, number>>((acc, answer) => {
    acc[answer.questionId] = (acc[answer.questionId] ?? 0) + 1;
    return acc;
  }, {});

  return shuffle(items)
    .map((question) => ({ question, attempts: attempts[question.id] ?? 0 }))
    .sort((a, b) => a.attempts - b.attempts)
    .map((item) => item.question);
};
const getQuestionType = (question: Question): QuestionType => question.questionType ?? "theory";
const getQuestionTypeLabel = (type: QuestionType | "All") => {
  if (type === "calculation") return "計算問題";
  if (type === "theory") return "理論問題";
  return "すべて";
};
const topicPointJa: Record<string, string> = {
  "Depreciation / Salvage Value": "残存価額がある減価償却では、取得原価そのものではなく「取得原価から残存価額を引いた金額」だけを償却する、という問題です。",
  "Moving-average inventory / Perpetual system": "継続記録法の移動平均では、仕入のたびに平均単価を更新し、その更新後の単価で売上原価を計算する問題です。",
  "Operating lease liability": "オペレーティングリースでも借手はリース負債を認識し、支払後は残りの支払額を現在価値に直す、という問題です。",
  "Current liabilities": "負債の名前ではなく、1年以内または営業循環期間内に決済されるかで流動負債かどうかを判断する問題です。",
  "Discontinued operations": "廃止事業として表示するには、単なる一部売却ではなく、事業や財務結果に大きな影響を与える戦略転換が必要かを見抜く問題です。",
  "Bonds interest expense period": "社債利息費用は発行日から決算日まで、未払利息は最後の利払日から決算日まで、という期間の違いを問う問題です。",
  "Sinking fund": "社債償還用の積立基金は現金だけでなく投資も含む制限付き資産で、投資収益により増えるという問題です。",
  "Long-lived asset impairment": "使用中の長期性資産は、まず割引前将来キャッシュフローで回収可能かを判定し、いきなり公正価値と比較しない問題です。",
  "Bond redemption / extinguishment": "社債の償還損益は、帳簿価額と買戻価格の差で判断する問題です。プレミアム・ディスカウント・発行費用の未償却残高を入れます。",
  "Basic EPS / cumulative preferred stock": "累積型優先株がある場合、Basic EPSでは実際支払額ではなく当期分の優先配当を控除する問題です。",
  "Factoring of accounts receivable": "売掛金をファクタリングしたとき、現金収入の計算では手数料・留保額・利息を差し引き、償還義務は現金計算に入れない問題です。",
  "Bonds with detachable warrants": "分離可能な新株予約権付き社債で片方だけ公正価値が分かる場合、分かる方を先に配分し、残りを社債に配分する問題です。",
  "Percentage-of-completion method": "工事進行基準では、進捗率に見積総利益を掛けて当期利益を出し、請求額や入金額に引っ張られない問題です。",
  "Escrow liability": "顧客から預かったエスクロー資金は会社の収益ではなく負債で、顧客のための支払や利息控除後の増減を追う問題です。",
  "Ordinary annuity / single-sum PV": "毎年の均等支払は年金現価係数、将来1回だけの支払は単一金額の現価係数を使い分ける問題です。",
  "Prior service cost": "年金制度の変更で過去勤務分の給付が増えたとき、最初にその他包括利益へ認識し、その後費用化していく論点です。"
};
const getQuestionPoint = (question: Question) => {
  if (topicPointJa[question.topic]) return topicPointJa[question.topic];
  const sectionMatch = question.explanationJa.match(/1\.\s*問題のポイント:\s*([^\n]+)/);
  if (sectionMatch?.[1] && !/[A-Za-z]{4,}.*を識別する問題/.test(sectionMatch[1])) return sectionMatch[1].trim();
  const firstSentence = question.explanationJa.split("。")[0]?.trim();
  if (firstSentence && !/[A-Za-z]{4,}.*を識別する問題/.test(firstSentence)) return `${firstSentence}。`;
  if (getQuestionType(question) === "calculation") {
    return `この問題は「${question.topic}」の計算問題です。与えられた数値のうち、使うものと無視するものを切り分けるのがポイントです。`;
  }
  return `この問題は「${question.topic}」の理論問題です。用語の名前ではなく、要件・判断基準・結論のつながりを押さえるのがポイントです。`;
};

export function AuditQuestionPanel({ questions }: AuditQuestionPanelProps) {
  const [mode, setMode] = useState<Mode>("setup");
  const [subject, setSubject] = useState<Subject>("FAR");
  const [category, setCategory] = useState("All");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | "All">("All");
  const [questionType, setQuestionType] = useState<QuestionType | "All">("All");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [reviewOnly, setReviewOnly] = useState(false);

  const getQuestionStats = useLearningStore((state) => state.getQuestionStats);
  const questionAnswers = useLearningStore((state) => state.questionAnswers);
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
        (difficulty === "All" || question.difficulty === difficulty) &&
        (questionType === "All" || getQuestionType(question) === questionType)
      );
    });
  }, [category, difficulty, questionType, subjectQuestions, topic]);

  const typeCounts = useMemo(() => {
    return subjectQuestions.reduce<Record<QuestionType | "All", number>>(
      (acc, question) => {
        acc.All += 1;
        acc[getQuestionType(question)] += 1;
        return acc;
      },
      { All: 0, calculation: 0, theory: 0 }
    );
  }, [subjectQuestions]);

  const current = quizQuestions[index];
  const isAnswered = selected !== null;
  const isCorrect = selected === current?.correctAnswer;
  const isLast = index >= quizQuestions.length - 1;
  const reviewCount = activeReviewIds.size;
  const filteredReviewCount = filteredQuestions.filter((question) => activeReviewIds.has(question.id)).length;
  const questionPoint = current ? getQuestionPoint(current) : "";
  const currentAttempts = current ? questionAnswers.filter((answer) => answer.questionId === current.id).length : 0;
  const currentMistakes = current ? reviewQuestions[current.id]?.mistakes ?? 0 : 0;

  const startQuiz = (useReviewOnly: boolean) => {
    const source = filteredQuestions.filter((question) => !useReviewOnly || activeReviewIds.has(question.id));
    const nextQuestions = prioritizeQuestionsByFewestAttempts(source, questionAnswers).slice(0, 20);
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
                  setQuestionType("All");
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

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {questionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setQuestionType(type)}
                className={`rounded-lg border p-3 text-left transition ${
                  questionType === type
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--hover)]"
                }`}
              >
                <span className="block text-sm font-semibold text-[var(--text)]">{getQuestionTypeLabel(type)}</span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{typeCounts[type]}問</span>
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
              disabled={filteredReviewCount === 0}
              className="h-11 rounded-md border border-[var(--border)] px-5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              間違えた問題だけ解く（{filteredReviewCount}問）
            </button>
            <p className="md:col-span-3 text-xs leading-5 text-[var(--muted)]">
              不正解だった問題は自動で復習リストに保存されます。現在の条件で復習できる問題は {filteredReviewCount}問です。
            </p>
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
                <Badge>{getQuestionTypeLabel(getQuestionType(current))}</Badge>
                <Badge>{currentAttempts > 0 ? `解答履歴 ${currentAttempts}回` : "初回"}</Badge>
                <Badge>{`過去ミス ${currentMistakes}回`}</Badge>
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
                <p className="text-lg font-semibold text-[var(--text)]">{isCorrect ? "正解" : "不正解"}</p>
                {!isCorrect ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">この問題は復習リストに保存しました。あとで「間違えた問題だけ解く」から解き直せます。</p>
                ) : null}
                <div className="mt-3 rounded-md bg-[var(--card)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">問題のポイント</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">{questionPoint}</p>
                </div>
                <details className="mt-3 rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">詳細解説を開く</summary>
                  <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--muted)]">
                    <section>
                      <p className="font-semibold text-[var(--text)]">日本語解説</p>
                      <p className="mt-1 whitespace-pre-line">{current.explanationJa}</p>
                    </section>
                    {current.examTechnique ? (
                      <section>
                        <p className="font-semibold text-[var(--text)]">試験での見抜き方</p>
                        <p className="mt-1">{current.examTechnique}</p>
                      </section>
                    ) : null}
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
