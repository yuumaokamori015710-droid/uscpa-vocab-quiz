import { additionalUscpaWords } from "@/data/additionalUscpaWords";
import { uscpaWords } from "@/data/uscpaWords";
import type { Subject, Word } from "@/types";

export interface WordRepository {
  findAll(): Promise<Word[]>;
  findBySubject(subject: Subject): Promise<Word[]>;
  findByIds(ids: string[]): Promise<Word[]>;
}

export class LocalWordRepository implements WordRepository {
  private readonly words = mergeWords(uscpaWords, additionalUscpaWords);

  async findAll() {
    return this.words;
  }

  async findBySubject(subject: Subject) {
    return this.words.filter((word) => word.subject === subject);
  }

  async findByIds(ids: string[]) {
    const idSet = new Set(ids);
    return this.words.filter((word) => idSet.has(word.id));
  }
}

export const wordRepository: WordRepository = new LocalWordRepository();

function mergeWords(...wordGroups: Word[][]) {
  const seen = new Set<string>();
  return wordGroups.flat().filter((word) => {
    const key = `${word.subject}:${word.term.trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
