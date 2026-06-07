"use client";

import { useMemo, useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { studyTracks } from "@/data/studyTracks";
import { useLearningStore } from "@/store/useLearningStore";
import type { CpaStudySubject, StudyGoal, StudyType } from "@/types";

const subjects: CpaStudySubject[] = studyTracks.map((track) => track.id);
const studyTypes: StudyType[] = ["Lecture", "MCQ", "TBS", "Review", "Vocabulary", "Other"];
const weekdayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const weekdayLabels: Record<(typeof weekdayKeys)[number], string> = {
  monday: "月",
  tuesday: "火",
  wednesday: "水",
  thursday: "木",
  friday: "金"
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const numberValue = (value: FormDataEntryValue | null) => Number(value || 0);
const roundHours = (value: number) => Math.round(value * 10) / 10;

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{children}</label>;
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
    />
  );
}

function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
    />
  );
}

export function StudyDashboard() {
  const studyGoal = useLearningStore((state) => state.studyGoal);
  const studyLogs = useLearningStore((state) => state.studyLogs);
  const updateStudyGoal = useLearningStore((state) => state.updateStudyGoal);
  const addStudyLog = useLearningStore((state) => state.addStudyLog);
  const deleteStudyLog = useLearningStore((state) => state.deleteStudyLog);
  const getProgressSummary = useLearningStore((state) => state.getProgressSummary);
  const progress = useMemo(() => getProgressSummary(), [getProgressSummary, studyGoal, studyLogs]);
  const todayStudyHours = useLearningStore((state) => state.getTodayStudyHours());
  const weeklyStudyHours = useLearningStore((state) => state.getWeeklyStudyHours());
  const [goalDraft, setGoalDraft] = useState<StudyGoal>(studyGoal);

  const subjectStudiedHours = useMemo(() => {
    return studyLogs.reduce<Record<CpaStudySubject, number>>(
      (acc, log) => {
        acc[log.subject] = roundHours(acc[log.subject] + log.hours);
        return acc;
      },
      {
        FAR: 0,
        AUD: 0,
        REG: 0,
        BAR: 0
      }
    );
  }, [studyLogs]);

  const handleGoalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateStudyGoal(goalDraft);
  };

  const handleLogSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addStudyLog({
      date: String(formData.get("date") || todayKey()),
      subject: String(formData.get("subject") || "FAR") as CpaStudySubject,
      hours: numberValue(formData.get("hours")),
      studyType: String(formData.get("studyType") || "Lecture") as StudyType,
      memo: String(formData.get("memo") || "")
    });
    event.currentTarget.reset();
  };

  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">USCPA Overall Study Pacemaker</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">USCPA全体の進捗</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              単語クイズの解答数ではなく、講義・MCQ・TBS・復習などUSCPA学習全体の手動記録から計算します。
            </p>
          </div>
          <div className="grid gap-2 text-right">
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs text-[var(--muted)]">Current Subject</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">{studyGoal.currentSubject}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="今日の自学時間" value={`${todayStudyHours}h`} />
          <Metric label="今週の自学時間" value={`${weeklyStudyHours}h`} />
          <Metric label="USCPA累計学習" value={`${progress.totalStudiedHours}h`} />
          <Metric label="USCPA全体進捗率" value={`${progress.progressRate}%`} />
          <Metric label="本来あるべき進捗" value={`${progress.expectedHoursByToday}h`} />
          <Metric label="不足" value={`${progress.deficitHours}h`} alert={progress.deficitHours > 0} />
          <Metric label="残り週数" value={`${progress.remainingWeeks}週`} />
          <Metric label="今週あと必要" value={`${progress.requiredThisWeekHours}h`} alert={progress.requiredThisWeekHours > 0} />
        </div>

        <div className="mt-5 rounded-lg bg-[var(--surface)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-[var(--text)]">土日で巻き返すなら</p>
            <p className="text-sm text-[var(--muted)]">残り {progress.remainingDays}日 / 必要週平均 {progress.requiredWeeklyHours}h</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-sm text-[var(--muted)]">土曜</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{progress.weekendCatchUpHours.saturday}h</p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-sm text-[var(--muted)]">日曜</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{progress.weekendCatchUpHours.sunday}h</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {subjects.map((subject) => {
            const target = studyGoal.subjectTargetHours[subject];
            const studied = subjectStudiedHours[subject];
            const rate = target === 0 ? 0 : Math.min(100, roundHours((studied / target) * 100));
            return (
              <div key={subject} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--text)]">{subject}</p>
                  <p className="text-xs text-[var(--muted)]">{studied}/{target}h</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--card)]">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6">
        <form onSubmit={handleLogSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-xl font-semibold text-[var(--text)]">USCPA自学時間記録</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>日付</FieldLabel>
              <TextInput type="date" name="date" defaultValue={todayKey()} required />
            </div>
            <div>
              <FieldLabel>科目</FieldLabel>
              <SelectInput name="subject" defaultValue={studyGoal.currentSubject}>
                {subjects.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </SelectInput>
            </div>
            <div>
              <FieldLabel>学習時間</FieldLabel>
              <TextInput type="number" name="hours" min="0.1" step="0.1" placeholder="1.5" required />
            </div>
            <div>
              <FieldLabel>学習種別</FieldLabel>
              <SelectInput name="studyType" defaultValue="Lecture">
                {studyTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </SelectInput>
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>メモ</FieldLabel>
              <TextInput name="memo" placeholder="FAR Lecture、MCQ 30問、TBS復習など" />
            </div>
          </div>
          <button className="mt-4 h-11 w-full rounded-md bg-[var(--accent)] text-sm font-semibold text-[var(--background)]">
            記録する
          </button>
        </form>

        <form onSubmit={handleGoalSubmit} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-xl font-semibold text-[var(--text)]">目標設定</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>学習開始日</FieldLabel>
              <TextInput type="date" value={goalDraft.startDate} onChange={(event) => setGoalDraft({ ...goalDraft, startDate: event.target.value })} />
            </div>
            <div>
              <FieldLabel>合格目標日</FieldLabel>
              <TextInput type="date" value={goalDraft.targetDate} onChange={(event) => setGoalDraft({ ...goalDraft, targetDate: event.target.value })} />
            </div>
            <div>
              <FieldLabel>目標総勉強時間</FieldLabel>
              <TextInput type="number" value={goalDraft.targetTotalHours} onChange={(event) => setGoalDraft({ ...goalDraft, targetTotalHours: Number(event.target.value) })} />
            </div>
            <div>
              <FieldLabel>週あたり可能時間</FieldLabel>
              <TextInput type="number" step="0.5" value={goalDraft.weeklyAvailableHours} onChange={(event) => setGoalDraft({ ...goalDraft, weeklyAvailableHours: Number(event.target.value) })} />
            </div>
            <div>
              <FieldLabel>現在の累計時間</FieldLabel>
              <TextInput type="number" step="0.5" value={goalDraft.currentCumulativeHours} onChange={(event) => setGoalDraft({ ...goalDraft, currentCumulativeHours: Number(event.target.value) })} />
            </div>
            <div>
              <FieldLabel>現在学習中の科目</FieldLabel>
              <SelectInput value={goalDraft.currentSubject} onChange={(event) => setGoalDraft({ ...goalDraft, currentSubject: event.target.value as CpaStudySubject })}>
                {subjects.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </SelectInput>
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel>平日の学習可能時間</FieldLabel>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {weekdayKeys.map((day) => (
                <label key={day} className="text-sm text-[var(--muted)]">
                  {weekdayLabels[day]}
                  <input
                    type="number"
                    step="0.5"
                    value={goalDraft.weekdayPlan[day] ?? 0}
                    onChange={(event) =>
                      setGoalDraft({
                        ...goalDraft,
                        weekdayPlan: { ...goalDraft.weekdayPlan, [day]: Number(event.target.value) }
                      })
                    }
                    className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>休日頻度</FieldLabel>
              <SelectInput
                value={goalDraft.weekendPlan.frequency}
                onChange={(event) =>
                  setGoalDraft({
                    ...goalDraft,
                    weekendPlan: { ...goalDraft.weekendPlan, frequency: event.target.value as StudyGoal["weekendPlan"]["frequency"] }
                  })
                }
              >
                <option value="weekly">毎週</option>
                <option value="biweekly">隔週</option>
              </SelectInput>
            </div>
            <div>
              <FieldLabel>休日1日の学習時間</FieldLabel>
              <TextInput
                type="number"
                step="0.5"
                value={goalDraft.weekendPlan.hoursPerDay}
                onChange={(event) =>
                  setGoalDraft({
                    ...goalDraft,
                    weekendPlan: { ...goalDraft.weekendPlan, hoursPerDay: Number(event.target.value) }
                  })
                }
              />
            </div>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            {subjects.map((subject) => (
              <label key={subject} className="text-sm text-[var(--muted)]">
                {subject}目標
                <input
                  type="number"
                  value={goalDraft.subjectTargetHours[subject]}
                  onChange={(event) =>
                    setGoalDraft({
                      ...goalDraft,
                      subjectTargetHours: { ...goalDraft.subjectTargetHours, [subject]: Number(event.target.value) }
                    })
                  }
                  className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
              </label>
            ))}
          </div>
          <button className="mt-4 h-11 w-full rounded-md border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)]">
            目標を保存
          </button>
        </form>
      </div>

      <div className="xl:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text)]">USCPA科目別進捗</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              教材ブランドに依存しない汎用トラックです。講義、問題演習、復習、模試対策の時間を科目ごとに積み上げます。
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {studyTracks.map((track) => {
            const target = studyGoal.subjectTargetHours[track.id] ?? 0;
            const studied = subjectStudiedHours[track.id] ?? 0;
            const rate = target === 0 ? 0 : Math.min(100, roundHours((studied / target) * 100));

            return (
              <div key={track.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--text)]">{track.label}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{track.description}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--card)]">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${rate}%` }} />
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">{studied}/{target}h</p>
                <ul className="mt-3 space-y-1">
                  {track.units.slice(0, 4).map((unit) => (
                    <li key={unit} className="truncate text-xs text-[var(--subtle)]" title={unit}>
                      {unit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="xl:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-xl font-semibold text-[var(--text)]">最近の自学ログ</h2>
        <div className="mt-4 grid gap-3">
          {studyLogs.length === 0 ? (
            <p className="rounded-lg bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">まだ自学ログはありません。</p>
          ) : (
            studyLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="grid gap-3 rounded-lg bg-[var(--surface)] p-4 md:grid-cols-[7rem_4rem_5rem_1fr_auto] md:items-center">
                <p className="text-sm text-[var(--muted)]">{log.date}</p>
                <p className="font-semibold text-[var(--accent)]">{log.subject}</p>
                <p className="font-semibold text-[var(--text)]">{log.hours}h</p>
                <p className="text-sm text-[var(--subtle)]">{log.studyType}{log.memo ? ` / ${log.memo}` : ""}</p>
                <button onClick={() => deleteStudyLog(log.id)} className="h-9 rounded-md border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--hover)]">
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${alert ? "text-[var(--wrong)]" : "text-[var(--text)]"}`}>{value}</p>
    </div>
  );
}
