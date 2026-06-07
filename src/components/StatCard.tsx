type StatCardProps = {
  label: string;
  value: string | number;
  caption?: string;
};

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--text)]">{value}</p>
      {caption ? <p className="mt-2 text-sm text-[var(--muted)]">{caption}</p> : null}
    </div>
  );
}
