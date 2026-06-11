import { audQuestions } from "@/data/audQuestions";
import type { Question, QuestionDifficulty, Subject } from "@/types";

export type QuestionFilters = {
  subject?: Subject;
  category?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  reviewIds?: string[];
};

export interface QuestionRepository {
  findAll(): Promise<Question[]>;
  findByFilters(filters: QuestionFilters): Promise<Question[]>;
  findByIds(ids: string[]): Promise<Question[]>;
}

const questionSeeds = [...audQuestions];

export class LocalQuestionRepository implements QuestionRepository {
  async findAll() {
    return questionSeeds;
  }

  async findByFilters(filters: QuestionFilters) {
    const reviewSet = filters.reviewIds ? new Set(filters.reviewIds) : null;
    return questionSeeds.filter((question) => {
      return (
        (!filters.subject || question.subject === filters.subject) &&
        (!filters.category || question.category === filters.category) &&
        (!filters.topic || question.topic === filters.topic) &&
        (!filters.difficulty || question.difficulty === filters.difficulty) &&
        (!reviewSet || reviewSet.has(question.id))
      );
    });
  }

  async findByIds(ids: string[]) {
    const idSet = new Set(ids);
    return questionSeeds.filter((question) => idSet.has(question.id));
  }
}

export const questionRepository: QuestionRepository = new LocalQuestionRepository();
