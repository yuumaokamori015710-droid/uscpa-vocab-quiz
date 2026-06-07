"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/types";

const shuffle = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

export function useQuiz(words: Word[], allWords: Word[]) {
  const [index, setIndex] = useState(0);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);

  const question = words[index];
  const choices = useMemo(() => {
    if (!question) return [];
    const distractors = shuffle(allWords.filter((word) => word.id !== question.id))
      .slice(0, 3)
      .map((word) => word.meaning);
    return shuffle([question.meaning, ...distractors]);
  }, [allWords, question]);

  const isAnswered = selectedMeaning !== null;
  const isCorrect = selectedMeaning === question?.meaning;
  const isLast = index >= words.length - 1;

  return {
    index,
    question,
    choices,
    selectedMeaning,
    isAnswered,
    isCorrect,
    isLast,
    select: setSelectedMeaning,
    next: () => {
      setSelectedMeaning(null);
      setIndex((current) => current + 1);
    },
    reset: () => {
      setIndex(0);
      setSelectedMeaning(null);
    }
  };
}
