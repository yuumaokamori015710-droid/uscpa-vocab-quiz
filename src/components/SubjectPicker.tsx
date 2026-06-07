import type { Subject } from "@/types";

const subjects: Array<{ id: Subject; title: string; description: string }> = [
  { id: "FAR", title: "FAR", description: "財務会計、連結、測定、開示" },
  { id: "AUD", title: "AUD", description: "監査証拠、リスク、意見、内部統制" },
  { id: "REG", title: "REG", description: "税法、契約、事業法、破産" },
  { id: "BAR", title: "BAR", description: "管理会計、財務分析、リスク、IT" }
];

type SubjectPickerProps = {
  onStart: (subject: Subject) => void;
};

export function SubjectPicker({ onStart }: SubjectPickerProps) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text)]">Subject Selection</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">科目を選ぶと20問のデッキからクイズを開始します。</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onStart(subject.id)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[var(--hover)]"
          >
            <span className="text-2xl font-semibold text-[var(--accent)]">{subject.title}</span>
            <span className="mt-4 block text-sm leading-6 text-[var(--muted)]">{subject.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
