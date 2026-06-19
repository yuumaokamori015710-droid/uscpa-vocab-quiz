"use client";

import { useMemo, useState } from "react";
import type { Word } from "@/types";

const shuffle = <T,>(items: T[]) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const categoryTerms = {
  "standards-framework": ["FASB", "ASC", "SFAC", "GAAP", "Accounting Standards Codification", "Conceptual Framework"],
  "comprehensive-income": [
    "Comprehensive Income",
    "Other Comprehensive Income",
    "OCI",
    "AOCI",
    "Foreign Currency Translation Gain",
    "Cash Flow Hedge",
    "Prior Service Cost"
  ],
  "revenue-expense": [
    "Revenue",
    "Gain",
    "Primary Operations",
    "Incidental Transactions",
    "General and Administrative Expenses",
    "Selling Expenses",
    "Freight-in",
    "Freight-out"
  ],
  factoring: ["Factoring", "With Recourse", "Without Recourse", "Recourse Obligation", "Holdback", "Control Surrendered"],
  "bonds-debt": [
    "Bond Discount",
    "Bond Premium",
    "Carrying Amount",
    "Reacquisition Price",
    "Bond Redemption",
    "Extinguishment of Debt",
    "Senior Bonds",
    "Outstanding Bonds"
  ],
  warrants: ["Detachable Stock Warrants", "Incremental Method"],
  leases: [
    "Lease Liability",
    "Operating Lease",
    "Finance Lease",
    "Guaranteed Residual Value",
    "Residual Value",
    "Salvage Value",
    "Purchase Option",
    "Ordinary Annuity",
    "Single Sum",
    "Implicit Rate",
    "Incremental Borrowing Rate"
  ],
  "restricted-cash": ["Sinking Fund", "Restricted Cash", "Revenue Earned on Investments"],
  eps: ["Basic EPS", "Cumulative Preferred Stock", "Dividends in Arrears", "Outstanding Shares"],
  inventory: ["Perpetual Inventory System", "Moving Average Method", "Weighted Average Method"],
  "liabilities-contingencies": [
    "Escrow Liability",
    "Escrow Payments",
    "Deferred Income Tax Liability",
    "Current Liability",
    "Noncurrent Liability",
    "Contingent Liability",
    "Lawsuit Filed"
  ],
  impairment: ["Impairment", "Recoverability Test", "Undiscounted Cash Flow", "Fair Value", "Book Value", "Carrying Value"],
  "discontinued-operations": ["Discontinued Operation", "Strategic Shift"],
  "audit-mindset": ["Professional Skepticism", "Professional Judgment", "Error", "Fraud", "Misappropriation of Assets", "Defalcation"],
  "audit-opinions": ["Qualified Opinion", "Adverse Opinion", "Disclaimer of Opinion", "Unmodified Opinion"],
  "audit-engagement": ["Engagement Letter", "Successor Auditor", "Predecessor Auditor"],
  "audit-risk-procedures": ["Control Risk", "Substantive Procedures", "Tests of Controls", "Vouching", "Tracing"],
  "audit-controls": ["Lockbox", "Blind Purchase Order", "Segregation of Duties", "Bank Confirmation", "Independent Custodian"],
  "audit-reporting-materiality": ["Going Concern", "Emphasis-of-Matter Paragraph", "Materiality", "Performance Materiality"]
} satisfies Record<string, string[]>;

const normalizeTerm = (term: string) => term.trim().toLowerCase();

const categoryByTerm = new Map(
  Object.entries(categoryTerms).flatMap(([category, terms]) => terms.map((term) => [normalizeTerm(term), category]))
);

const getWordCategory = (word: Word) => categoryByTerm.get(normalizeTerm(word.term)) ?? word.subject;

const buildDistractors = (question: Word, allWords: Word[]) => {
  const questionCategory = getWordCategory(question);
  const baseCandidates = allWords.filter((word) => word.id !== question.id && word.meaning !== question.meaning);
  const selected: Word[] = [];
  const usedMeanings = new Set<string>([question.meaning]);

  const collect = (candidates: Word[]) => {
    for (const word of shuffle(candidates)) {
      if (selected.length >= 3) return;
      if (usedMeanings.has(word.meaning)) continue;
      selected.push(word);
      usedMeanings.add(word.meaning);
    }
  };

  collect(baseCandidates.filter((word) => word.subject === question.subject && getWordCategory(word) === questionCategory));
  collect(baseCandidates.filter((word) => word.subject === question.subject));
  collect(baseCandidates.filter((word) => getWordCategory(word) === questionCategory));
  collect(baseCandidates);

  return selected.slice(0, 3).map((word) => word.meaning);
};

export function useQuiz(words: Word[], allWords: Word[]) {
  const [index, setIndex] = useState(0);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);

  const question = words[index];
  const choices = useMemo(() => {
    if (!question) return [];
    const distractors = buildDistractors(question, allWords);
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
