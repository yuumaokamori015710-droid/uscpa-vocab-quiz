import type { OnboardingDeck, OnboardingQuestion } from "@/types";

const MAX_QUESTIONS = 16;

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const stopWords = new Set([
  "about",
  "after",
  "also",
  "before",
  "between",
  "from",
  "into",
  "must",
  "only",
  "over",
  "shall",
  "that",
  "their",
  "there",
  "these",
  "this",
  "when",
  "where",
  "with",
  "within",
  "your"
]);

const normalizeText = (text: string) =>
  text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const cleanupPdfText = (text: string) =>
  text
    .replace(/\\([nrtbf])/g, " ")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

export const extractReadablePdfText = (rawPdfText: string) => {
  const literalStrings = Array.from(rawPdfText.matchAll(/\(([^()]{12,})\)/g))
    .map((match) => cleanupPdfText(match[1] ?? ""))
    .filter((value) => /[A-Za-z0-9\u3040-\u30ff\u3400-\u9fff]/.test(value));

  const textOperators = Array.from(rawPdfText.matchAll(/\[([\s\S]*?)\]\s*TJ/g))
    .flatMap((match) => Array.from((match[1] ?? "").matchAll(/\(([^()]{6,})\)/g)).map((item) => cleanupPdfText(item[1] ?? "")))
    .filter((value) => /[A-Za-z0-9\u3040-\u30ff\u3400-\u9fff]/.test(value));

  return normalizeText([...literalStrings, ...textOperators].join(" "));
};

const splitSentences = (text: string) => {
  const normalized = normalizeText(text);
  return normalized
    .split(/(?<=[。.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 32 && sentence.length <= 260)
    .filter((sentence, index, items) => items.findIndex((item) => item.toLowerCase() === sentence.toLowerCase()) === index);
};

const extractKeywords = (text: string) => {
  const englishTerms = Array.from(text.matchAll(/\b[A-Z][A-Za-z0-9/&-]*(?:\s+[A-Z][A-Za-z0-9/&-]*){0,4}\b/g))
    .map((match) => match[0])
    .filter((term) => term.length >= 4 && !stopWords.has(term.toLowerCase()));

  const japaneseTerms = Array.from(text.matchAll(/[\u3400-\u9fff\u3040-\u30ff]{3,12}/g)).map((match) => match[0]);
  const counts = [...englishTerms, ...japaneseTerms].reduce<Record<string, number>>((acc, term) => {
    acc[term] = (acc[term] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
    .slice(0, 24);
};

const findTopic = (sentence: string, keywords: string[], fallback: string) => {
  const keyword = keywords.find((item) => sentence.toLowerCase().includes(item.toLowerCase()));
  if (keyword) return keyword;

  const firstNoun = sentence.match(/\b[A-Z][A-Za-z0-9/&-]{3,}\b/)?.[0];
  return firstNoun ?? fallback;
};

const inferCategory = (sentence: string) => {
  const lower = sentence.toLowerCase();
  if (/approve|approval|authorize|承認|決裁/.test(lower)) return "Approval";
  if (/risk|control|review|check|確認|管理|リスク/.test(lower)) return "Control";
  if (/step|process|workflow|procedure|手順|フロー|処理/.test(lower)) return "Process";
  if (/deadline|date|monthly|weekly|期限|締切|月次|週次/.test(lower)) return "Schedule";
  if (/customer|client|vendor|supplier|顧客|取引先|ベンダー/.test(lower)) return "Stakeholder";
  return "Knowledge";
};

const buildDistractors = (answer: string, pool: string[]) => {
  const compactAnswer = answer.toLowerCase();
  const candidates = shuffle(pool)
    .filter((item) => item.toLowerCase() !== compactAnswer)
    .filter((item, index, items) => items.findIndex((next) => next.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, 3);

  const fallback = [
    "上長承認が不要な場合のみ実施する。",
    "例外処理として記録せずに進める。",
    "月末にまとめて確認すれば十分である。",
    "担当者の判断だけで完了扱いにする。"
  ];

  return [...candidates, ...fallback.filter((item) => item.toLowerCase() !== compactAnswer)].slice(0, 3);
};

const makeQuestion = (deckId: string, sentence: string, index: number, allSentences: string[], keywords: string[]): OnboardingQuestion => {
  const topic = findTopic(sentence, keywords, `Topic ${index + 1}`);
  const category = inferCategory(sentence);
  const correctAnswer = sentence.replace(/\s+/g, " ");
  const distractors = buildDistractors(correctAnswer, allSentences.map((item) => item.replace(/\s+/g, " ")));

  return {
    id: `${deckId}-q-${index + 1}`,
    deckId,
    category,
    topic,
    difficulty: index % 5 === 0 ? "Hard" : index % 2 === 0 ? "Medium" : "Easy",
    question: `「${topic}」について、この資料の内容として最も適切なものはどれですか。`,
    choices: shuffle([correctAnswer, ...distractors]),
    correctAnswer,
    explanation: `資料では「${correctAnswer}」という点が重要です。新しい部署でまず押さえるべきなのは、用語そのものよりも、誰が・いつ・何を判断するかです。`,
    keyTakeaway: `${topic} は ${category.toLowerCase()} の観点で確認する。`,
    sourceExcerpt: correctAnswer
  };
};

export const createOnboardingDeck = (params: { title: string; sourceName: string; sourceText: string }): OnboardingDeck => {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
  const sourceText = normalizeText(params.sourceText);
  const sentences = splitSentences(sourceText);
  const keywords = extractKeywords(sourceText);
  const usableSentences = sentences.length >= 4 ? sentences : splitSentences(`${sourceText}. ${sourceText}`);
  const selectedSentences = shuffle(usableSentences).slice(0, MAX_QUESTIONS);

  return {
    id,
    title: params.title.trim() || "Untitled onboarding deck",
    sourceName: params.sourceName,
    createdAt: new Date().toISOString(),
    sourceText,
    questions: selectedSentences.map((sentence, index) => makeQuestion(id, sentence, index, usableSentences, keywords))
  };
};
