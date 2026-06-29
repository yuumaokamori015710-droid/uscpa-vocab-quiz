export type Subject = "FAR" | "AUD" | "REG" | "BAR";

export type CpaStudySubject = Subject;

export type WordStatus = "New" | "Learning" | "Mastered";

export type StudyType = "Lecture" | "MCQ" | "TBS" | "Review" | "Vocabulary" | "Other";

export type ThemeMode = "dark" | "light";

export type QuestionDifficulty = "Easy" | "Medium" | "Hard";

export type QuestionType = "calculation" | "theory";

export type Word = {
  id: string;
  term: string;
  meaning: string;
  subject: Subject;
  explanation: string;
};

export type Answer = {
  wordId: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type Question = {
  id: string;
  subject: Subject;
  category: string;
  topic: string;
  concept?: string;
  questionType?: QuestionType;
  difficulty: QuestionDifficulty;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanationJa: string;
  keyTakeaway: string;
  examTechnique?: string;
  trapExplanation: string;
  relatedTopics?: string[];
};

export type QuestionAnswer = {
  questionId: string;
  isCorrect: boolean;
  answeredAt: string;
};

export type ReviewQuestion = {
  questionId: string;
  mistakes: number;
  lastAnsweredAt: string;
  mastered: boolean;
};

export type UserStats = {
  totalAnswered: number;
  todayAnswered: number;
  weeklyAnswered: number;
  accuracyRate: number;
  streak: number;
};

export type Friend = {
  id: string;
  name: string;
  weeklyAnswered: number;
  accuracyRate: number;
  streak: number;
};

export type WeakWord = {
  wordId: string;
  status: WordStatus;
  mistakes: number;
  lastAnsweredAt: string;
};

export type StudyGoal = {
  startDate: string;
  targetDate: string;
  targetTotalHours: number;
  subjectTargetHours: Record<CpaStudySubject, number>;
  weeklyAvailableHours: number;
  weekdayPlan: Partial<Record<"monday" | "tuesday" | "wednesday" | "thursday" | "friday", number>>;
  weekendPlan: {
    frequency: "weekly" | "biweekly";
    days: Array<"saturday" | "sunday">;
    hoursPerDay: number;
  };
  currentCumulativeHours: number;
  currentSubject: CpaStudySubject;
  unpassedSubjects: CpaStudySubject[];
};

export type StudyLog = {
  id: string;
  date: string;
  subject: CpaStudySubject;
  hours: number;
  studyType: StudyType;
  memo: string;
};

export type ProgressSummary = {
  totalStudiedHours: number;
  targetTotalHours: number;
  progressRate: number;
  expectedHoursByToday: number;
  deficitHours: number;
  remainingDays: number;
  remainingWeeks: number;
  requiredWeeklyHours: number;
  requiredThisWeekHours: number;
  weekendCatchUpHours: {
    saturday: number;
    sunday: number;
  };
};

export type StudyTrack = {
  id: CpaStudySubject;
  label: string;
  description: string;
  units: string[];
};

export type OnboardingQuestion = {
  id: string;
  deckId: string;
  category: string;
  topic: string;
  difficulty: QuestionDifficulty;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  keyTakeaway: string;
  sourceExcerpt: string;
};

export type OnboardingDeck = {
  id: string;
  title: string;
  sourceName: string;
  createdAt: string;
  sourceText: string;
  questions: OnboardingQuestion[];
};

export type OnboardingQuestionAnswer = {
  questionId: string;
  isCorrect: boolean;
  answeredAt: string;
};
