"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLearningStore } from "@/store/useLearningStore";

type AppShellProps = {
  activeView: string;
  onNavigate: (view: "home" | "weak" | "friends") => void;
  children: ReactNode;
};

export function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  const theme = useLearningStore((state) => state.theme);
  const setTheme = useLearningStore((state) => state.setTheme);
  const items = [
    { id: "home", label: "Home" },
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-1">
            {(["dark", "light"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`h-10 rounded-md px-4 text-sm font-medium transition ${
                  theme === mode ? "bg-[var(--accent)] text-[var(--background)]" : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                {mode === "dark" ? "Dark" : "White"}
              </button>
            ))}
          </div>
          <nav className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-1 sm:w-auto">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`h-10 flex-1 rounded-md px-4 text-sm font-medium transition sm:flex-none ${
                  activeView === item.id
                    ? "bg-[var(--accent)] text-[var(--background)]"
                    : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
