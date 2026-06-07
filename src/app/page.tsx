"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FriendsPanel } from "@/components/FriendsPanel";
import { QuizPanel } from "@/components/QuizPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { StatCard } from "@/components/StatCard";
import { StudyDashboard } from "@/components/StudyDashboard";
import { SubjectPicker } from "@/components/SubjectPicker";
import { WeakWordsPanel } from "@/components/WeakWordsPanel";
import { friendRepository } from "@/lib/repositories/friendRepository";
import { wordRepository } from "@/lib/repositories/wordRepository";
import { useLearningStore } from "@/store/useLearningStore";
import type { Friend, Subject, Word } from "@/types";

type View = "home" | "quiz" | "result" | "weak" | "friends";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [words, setWords] = useState<Word[]>([]);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [quizSubject, setQuizSubject] = useState<Subject | "Weak">("FAR");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [mounted, setMounted] = useState(false);

  const resetSession = useLearningStore((state) => state.resetSession);
  const getStats = useLearningStore((state) => state.getStats);
  const getProgressSummary = useLearningStore((state) => state.getProgressSummary);
  const answers = useLearningStore((state) => state.answers);
  const studyGoal = useLearningStore((state) => state.studyGoal);
  const studyLogs = useLearningStore((state) => state.studyLogs);
  const stats = getStats();
  const todayStudyHours = useLearningStore((state) => state.getTodayStudyHours());
  const weeklyStudyHours = useLearningStore((state) => state.getWeeklyStudyHours());
  const progress = useMemo(() => getProgressSummary(), [getProgressSummary, studyGoal, studyLogs]);

  useEffect(() => {
    setMounted(true);
    wordRepository.findAll().then(setWords);
  }, []);

  useEffect(() => {
    friendRepository.getWeeklyRanking(stats).then(setFriends);
  }, [answers.length, stats.accuracyRate, stats.streak, stats.weeklyAnswered]);

  const weakCount = useLearningStore((state) => Object.values(state.weakWords).filter((word) => word.status !== "Mastered").length);

  const deckCounts = useMemo(() => {
    return words.reduce<Record<Subject, number>>(
      (acc, word) => {
        acc[word.subject] += 1;
        return acc;
      },
      { FAR: 0, AUD: 0, REG: 0, BAR: 0 }
    );
  }, [words]);

  const startSubjectQuiz = async (subject: Subject) => {
    const subjectWords = await wordRepository.findBySubject(subject);
    resetSession();
    setQuizSubject(subject);
    setQuizWords(subjectWords);
    setView("quiz");
  };

  const startWeakQuiz = (reviewWords: Word[]) => {
    resetSession();
    setQuizSubject("Weak");
    setQuizWords(reviewWords);
    setView("quiz");
  };

  if (!mounted) {
    return (
      <AppShell activeView="home" onNavigate={(next) => setView(next)}>
        <section className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
          Loading...
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeView={view === "quiz" || view === "result" ? "home" : view} onNavigate={(next) => setView(next)}>
      {view === "home" ? (
        <>
          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="今日の解答数" value={stats.todayAnswered} caption="Daily answers" />
            <StatCard label="今週の解答数" value={stats.weeklyAnswered} caption="Weekly answers" />
            <StatCard label="今日の自学時間" value={`${todayStudyHours}h`} caption="Manual study" />
            <StatCard label="今週の自学時間" value={`${weeklyStudyHours}h`} caption="Weekly study" />
            <StatCard label="USCPA累計学習" value={`${progress.totalStudiedHours}h`} caption={`${progress.progressRate}% of total goal`} />
            <StatCard label="USCPA目標平均との差" value={`${progress.deficitHours}h`} caption="Overall study deficit" />
            <StatCard label="今週あと必要" value={`${progress.requiredThisWeekHours}h`} caption="USCPA total study" />
            <StatCard label="Streak" value={`${stats.streak}日`} caption={`${weakCount} weak words`} />
          </section>

          <section className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Vocabulary Quiz History</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  この欄は単語クイズの履歴です。USCPA全体の学習時間と進捗は下のペースメーカーで別管理します。
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {Object.entries(deckCounts).map(([subject, count]) => (
                  <div key={subject} className="rounded-md bg-[var(--surface)] px-4 py-3">
                    <p className="text-sm font-semibold text-[var(--accent)]">{subject}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{count}語</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <StudyDashboard />

          <SubjectPicker onStart={startSubjectQuiz} />
        </>
      ) : null}

      {view === "quiz" ? (
        <QuizPanel
          subject={quizSubject}
          words={quizWords}
          allWords={words}
          onFinish={() => setView("result")}
          onCancel={() => setView("home")}
        />
      ) : null}

      {view === "result" ? <ResultPanel onHome={() => setView("home")} /> : null}
      {view === "weak" ? <WeakWordsPanel words={words} onReview={startWeakQuiz} /> : null}
      {view === "friends" ? <FriendsPanel friends={friends} /> : null}
    </AppShell>
  );
}
