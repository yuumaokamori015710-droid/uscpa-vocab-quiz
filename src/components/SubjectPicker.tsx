import type { Subject } from "@/types";

const subjects: Array<{ id: Subject; title: string; description: string }> = [
  { id: "FAR", title: "FAR", description: "財務会計、連結、測定、開示" },
  { id: "AUD", title: "AUD", description: "監査証拠、リスク、意見、内部統制" },
  { id: "REG", title: "REG", description: "税法、契約、事業法、破産" },
  { id: "BAR", title: "BAR", description: "管理会計、財務分析、リスク、IT" }
];

type SubjectPickerProps = {
  counts: Record<Subject, number>;
  onStart: (subject: Subject) => void;
};

export function SubjectPicker({ counts, onStart }: SubjectPickerProps) {
  return (
    <section className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Start Quiz</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">クイズを開始</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">科目を選ぶと、登録済みの単語デッキから4択クイズを開始します。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onStart(subject.id)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--hover)]"
          >
            <span className="text-2xl font-semibold text-[var(--accent)]">{subject.title}</span>
            <span className="ml-3 text-sm font-semibold text-[var(--muted)]">{counts[subject.id] ?? 0}語</span>
            <span className="mt-4 block text-sm leading-6 text-[var(--muted)]">{subject.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
