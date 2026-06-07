"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLearningStore } from "@/store/useLearningStore";

export type AppView = "quizHome" | "study" | "weak" | "friends" | "settings";

type AppShellProps = {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
};

export function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  const theme = useLearningStore((state) => state.theme);
  const items = [
    { id: "quizHome", label: "Quiz" },
    { id: "study", label: "Study" },
    { id: "weak", label: "Weak Words" },
    { id: "friends", label: "Friends" }
  ] as const;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">USCPA Vocabulary</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text)] sm:text-3xl">USCPA Vocab Quiz</h1>
        </div>
        <div className="flex items-center gap-3">
          <nav className="grid flex-1 grid-cols-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 sm:flex sm:w-auto sm:flex-none">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`h-10 rounded-md px-2 text-sm font-medium transition sm:px-4 ${
                  activeView === item.id
                    ? "bg-[var(--accent)] text-[var(--background)]"
                    : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            aria-label="Settings"
            title="Settings"
            onClick={() => onNavigate("settings")}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-[var(--border)] transition ${
              activeView === "settings" ? "bg-[var(--accent)] text-[var(--background)]" : "bg-[var(--card)] text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
            }`}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" />
              <path d="M19 12a7.5 7.5 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7.7 7.7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.7a7.7 7.7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7.5 7.5 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7.7 7.7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7.7 7.7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
            </svg>
          </button>
        </div>
      </header>
      {children}
    </main>
  );
}
