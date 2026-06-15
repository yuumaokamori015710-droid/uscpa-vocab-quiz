"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { AppView } from "@/components/AppShell";
import { AuditQuestionPanel } from "@/components/AuditQuestionPanel";
import { FriendsPanel } from "@/components/FriendsPanel";
import { QuizPanel } from "@/components/QuizPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { StatCard } from "@/components/StatCard";
import { StudyDashboard } from "@/components/StudyDashboard";
import { SubjectPicker } from "@/components/SubjectPicker";
import { WeakWordsPanel } from "@/components/WeakWordsPanel";
import { friendRepository } from "@/lib/repositories/friendRepository";
import { questionRepository } from "@/lib/repositories/questionRepository";
import { wordRepository } from "@/lib/repositories/wordRepository";
import { useLearningStore } from "@/store/useLearningStore";
import type { Friend, Question, Subject, Word } from "@/types";

type View = AppView | "quiz" | "result";

export default function Home() {
  const [view, setView] = useState<View>("quizHome");
  const [words, setWords] = useState<Word[]>([]);
  const [quizWords, setQuizWords] = useState<Word[]>([]);
  const [quizSubject, setQuizSubject] = useState<Subject | "Weak">("FAR");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [mounted, setMounted] = useState(false);

  const resetSession = useLearningStore((state) => state.resetSession);
  const getStats = useLearningStore((state) => state.getStats);
  const answers = useLearningStore((state) => state.answers);
  const stats = getStats();
  const weakCount = useLearningStore((state) => Object.values(state.weakWords).filter((word) => word.status !== "Mastered").length);

  useEffect(() => {
    setMounted(true);
    wordRepository.findAll().then(setWords);
    questionRepository.findAll().then(setQuestions);
  }, []);

  useEffect(() => {
    friendRepository.getWeeklyRanking(stats).then(setFriends);
  }, [answers.length, stats.accuracyRate, stats.streak, stats.weeklyAnswered]);

  const deckCounts = useMemo(() => {
    return words.reduce<Record<Subject, number>>(
      (acc, word) => {
        acc[word.subject] += 1;
        return acc;
      },
      { FAR: 0, AUD: 0, REG: 0, BAR: 0 }
    );
  }, [words]);

  const activeView: AppView = view === "quiz" || view === "result" ? "quizHome" : view;

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
      <AppShell activeView="quizHome" onNavigate={(next) => setView(next)}>
        <section className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-sm text-[var(--muted)]">
          Loading...
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell activeView={activeView} onNavigate={(next) => setView(next)}>
      {view === "quizHome" ? (
        <>
          <SubjectPicker onStart={startSubjectQuiz} />

          <AuditQuestionPanel questions={questions} />

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="今日の解答数" value={stats.todayAnswered} caption="Daily answers" />
            <StatCard label="今週の解答数" value={stats.weeklyAnswered} caption="Weekly answers" />
            <StatCard label="正答率" value={`${stats.accuracyRate}%`} caption="Vocabulary accuracy" />
            <StatCard label="Streak" value={`${stats.streak}日`} caption={`${weakCount} weak words`} />
          </section>

          <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text)]">Vocabulary Decks</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">単語クイズの進捗だけをここで確認できます。USCPA全体の学習時間はStudyタブで管理します。</p>
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
        </>
      ) : null}

      {view === "study" ? <StudyDashboard /> : null}

      {view === "quiz" ? (
        <QuizPanel
          subject={quizSubject}
          words={quizWords}
          allWords={words}
          onFinish={() => setView("result")}
          onCancel={() => setView("quizHome")}
        />
      ) : null}

      {view === "result" ? <ResultPanel onHome={() => setView("quizHome")} /> : null}
      {view === "weak" ? <WeakWordsPanel words={words} onReview={startWeakQuiz} /> : null}
      {view === "friends" ? <FriendsPanel friends={friends} /> : null}
      {view === "settings" ? <SettingsPanel /> : null}
    </AppShell>
  );
}
