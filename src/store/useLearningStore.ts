"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Answer, ProgressSummary, StudyGoal, StudyLog, ThemeMode, UserStats, WeakWord, Word } from "@/types";

type SessionResult = {
  answered: number;
  correct: number;
  subjectLabel: string;
};

type LearningState = {
  theme: ThemeMode;
  answers: Answer[];
  weakWords: Record<string, WeakWord>;
  studyGoal: StudyGoal;
  studyLogs: StudyLog[];
  sessionAnswers: Answer[];
  lastSessionResult: SessionResult | null;
  setTheme: (theme: ThemeMode) => void;
  recordAnswer: (word: Word, isCorrect: boolean) => void;
  updateStudyGoal: (goal: StudyGoal) => void;
  addStudyLog: (log: Omit<StudyLog, "id">) => void;
  deleteStudyLog: (id: string) => void;
  resetSession: () => void;
  finishSession: (subjectLabel: string) => void;
  markWeakWordStatus: (wordId: string, status: WeakWord["status"]) => void;
  getStats: () => UserStats;
  getProgressSummary: () => ProgressSummary;
  getTodayStudyHours: () => number;
  getWeeklyStudyHours: () => number;
};

const toDateKey = (value: Date) => value.toISOString().slice(0, 10);

const startOfWeek = (date: Date) => {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? 6 : day - 1;
  next.setDate(next.getDate() - diff);
  next.setHours(0, 0, 0, 0);
  return next;
};

const toLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const hoursBetween = (start: string, end: string) => {
  return Math.max(0, (toLocalDate(end).getTime() - toLocalDate(start).getTime()) / 86_400_000);
};

const roundHours = (value: number) => Math.round(value * 10) / 10;

const defaultStudyGoal: StudyGoal = {
  startDate: "2026-06-01",
  targetDate: "2027-04-30",
  targetTotalHours: 900,
  subjectTargetHours: {
    FAR: 260,
    AUD: 210,
    REG: 230,
    BAR: 200
  },
  weeklyAvailableHours: 6,
  weekdayPlan: {
    wednesday: 3
  },
  weekendPlan: {
    frequency: "biweekly",
    days: ["saturday", "sunday"],
    hoursPerDay: 4
  },
  currentCumulativeHours: 0,
  currentSubject: "FAR",
  unpassedSubjects: ["FAR", "AUD", "REG", "BAR"]
};

const normalizeStudySubject = (value: unknown): StudyGoal["currentSubject"] => {
  if (value === "FAR" || value === "AUD" || value === "REG" || value === "BAR") {
    return value;
  }
  return defaultStudyGoal.currentSubject;
};

const calculateStreak = (answers: Answer[]) => {
  const answeredDays = new Set(answers.map((answer) => toDateKey(new Date(answer.answeredAt))));
  if (answeredDays.size === 0) return 0;

  let streak = 0;
  const cursor = new Date();

  while (answeredDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      answers: [],
      weakWords: {},
      studyGoal: defaultStudyGoal,
      studyLogs: [],
      sessionAnswers: [],
      lastSessionResult: null,

      setTheme: (theme) => set({ theme }),

      recordAnswer: (word, isCorrect) => {
        const answeredAt = new Date().toISOString();
        const answer: Answer = { wordId: word.id, isCorrect, answeredAt };

        set((state) => {
          const nextWeakWords = { ...state.weakWords };
          const current = nextWeakWords[word.id];

          if (!isCorrect) {
            nextWeakWords[word.id] = {
              wordId: word.id,
              status: current?.status === "Mastered" ? "Learning" : current?.status ?? "New",
              mistakes: (current?.mistakes ?? 0) + 1,
              lastAnsweredAt: answeredAt
            };
          } else if (current && current.status === "Learning") {
            nextWeakWords[word.id] = {
              ...current,
              status: current.mistakes >= 2 ? "Learning" : "Mastered",
              lastAnsweredAt: answeredAt
            };
          }

          return {
            answers: [...state.answers, answer],
            sessionAnswers: [...state.sessionAnswers, answer],
            weakWords: nextWeakWords
          };
        });
      },

      updateStudyGoal: (goal) => set({ studyGoal: goal }),

      addStudyLog: (log) => {
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
        set((state) => ({
          studyLogs: [{ ...log, id }, ...state.studyLogs].sort((a, b) => b.date.localeCompare(a.date))
        }));
      },

      deleteStudyLog: (id) => {
        set((state) => ({
          studyLogs: state.studyLogs.filter((log) => log.id !== id)
        }));
      },

      resetSession: () => set({ sessionAnswers: [], lastSessionResult: null }),

      finishSession: (subjectLabel) => {
        const sessionAnswers = get().sessionAnswers;
        set({
          lastSessionResult: {
            answered: sessionAnswers.length,
            correct: sessionAnswers.filter((answer) => answer.isCorrect).length,
            subjectLabel
          }
        });
      },

      markWeakWordStatus: (wordId, status) => {
        set((state) => {
          const weakWord = state.weakWords[wordId];
          if (!weakWord) return state;
          return {
            weakWords: {
              ...state.weakWords,
              [wordId]: { ...weakWord, status }
            }
          };
        });
      },

      getStats: () => {
        const answers = get().answers;
        const now = new Date();
        const todayKey = toDateKey(now);
        const weekStart = startOfWeek(now);
        const correct = answers.filter((answer) => answer.isCorrect).length;

        return {
          totalAnswered: answers.length,
          todayAnswered: answers.filter((answer) => toDateKey(new Date(answer.answeredAt)) === todayKey).length,
          weeklyAnswered: answers.filter((answer) => new Date(answer.answeredAt) >= weekStart).length,
          accuracyRate: answers.length === 0 ? 0 : Math.round((correct / answers.length) * 100),
          streak: calculateStreak(answers)
        };
      },

      getTodayStudyHours: () => {
        const todayKey = toDateKey(new Date());
        return roundHours(get().studyLogs.filter((log) => log.date === todayKey).reduce((sum, log) => sum + log.hours, 0));
      },

      getWeeklyStudyHours: () => {
        const weekStart = startOfWeek(new Date());
        return roundHours(get().studyLogs.filter((log) => toLocalDate(log.date) >= weekStart).reduce((sum, log) => sum + log.hours, 0));
      },

      getProgressSummary: () => {
        const { studyGoal, studyLogs } = get();
        const now = new Date();
        const todayKey = toDateKey(now);
        const startDate = toLocalDate(studyGoal.startDate);
        const targetDate = toLocalDate(studyGoal.targetDate);
        const totalGoalDays = Math.max(1, hoursBetween(studyGoal.startDate, studyGoal.targetDate));
        const elapsedDays = Math.min(totalGoalDays, Math.max(0, (toLocalDate(todayKey).getTime() - startDate.getTime()) / 86_400_000));
        const remainingDays = Math.max(0, Math.ceil((targetDate.getTime() - toLocalDate(todayKey).getTime()) / 86_400_000));
        const remainingWeeks = Math.max(1, Math.ceil(remainingDays / 7));
        const loggedHours = studyLogs.reduce((sum, log) => sum + log.hours, 0);
        const totalStudiedHours = roundHours(studyGoal.currentCumulativeHours + loggedHours);
        const expectedHoursByToday = roundHours((studyGoal.targetTotalHours * elapsedDays) / totalGoalDays);
        const remainingTargetHours = Math.max(0, studyGoal.targetTotalHours - totalStudiedHours);
        const weeklyStudyHours = get().getWeeklyStudyHours();
        const requiredWeeklyHours = roundHours(remainingTargetHours / remainingWeeks);
        const requiredThisWeekHours = roundHours(Math.max(0, requiredWeeklyHours - weeklyStudyHours));
        const saturday = roundHours(requiredThisWeekHours / 2);
        const sunday = roundHours(requiredThisWeekHours - saturday);

        return {
          totalStudiedHours,
          targetTotalHours: studyGoal.targetTotalHours,
          progressRate: studyGoal.targetTotalHours === 0 ? 0 : roundHours((totalStudiedHours / studyGoal.targetTotalHours) * 100),
          expectedHoursByToday,
          deficitHours: roundHours(Math.max(0, expectedHoursByToday - totalStudiedHours)),
          remainingDays,
          remainingWeeks,
          requiredWeeklyHours,
          requiredThisWeekHours,
          weekendCatchUpHours: {
            saturday,
            sunday
          }
        };
      }
    }),
    {
      name: "uscpa-vocab-learning",
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<LearningState> | undefined;
        const persistedGoal = persistedState?.studyGoal;
        const subjectTargetHours = {
          ...defaultStudyGoal.subjectTargetHours,
          ...persistedGoal?.subjectTargetHours
        };

        subjectTargetHours.FAR = Number(subjectTargetHours.FAR) || defaultStudyGoal.subjectTargetHours.FAR;
        subjectTargetHours.AUD = Number(subjectTargetHours.AUD) || defaultStudyGoal.subjectTargetHours.AUD;
        subjectTargetHours.REG = Number(subjectTargetHours.REG) || defaultStudyGoal.subjectTargetHours.REG;
        subjectTargetHours.BAR = Number(subjectTargetHours.BAR) || defaultStudyGoal.subjectTargetHours.BAR;

        return {
          ...current,
          ...persistedState,
          studyGoal: {
            ...defaultStudyGoal,
            ...persistedGoal,
            subjectTargetHours,
            currentSubject: normalizeStudySubject(persistedGoal?.currentSubject),
            unpassedSubjects: persistedGoal?.unpassedSubjects?.map(normalizeStudySubject) || defaultStudyGoal.unpassedSubjects
          }
        };
      }
    }
  )
);
