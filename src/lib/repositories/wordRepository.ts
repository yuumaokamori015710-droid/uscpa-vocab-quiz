import { uscpaWords } from "@/data/uscpaWords";
import type { Subject, Word } from "@/types";

export interface WordRepository {
  findAll(): Promise<Word[]>;
  findBySubject(subject: Subject): Promise<Word[]>;
  findByIds(ids: string[]): Promise<Word[]>;
}

export class LocalWordRepository implements WordRepository {
  async findAll() {
    return uscpaWords;
  }

  async findBySubject(subject: Subject) {
    return uscpaWords.filter((word) => word.subject === subject);
  }

  async findByIds(ids: string[]) {
    const idSet = new Set(ids);
    return uscpaWords.filter((word) => idSet.has(word.id));
  }
}

export const wordRepository: WordRepository = new LocalWordRepository();
