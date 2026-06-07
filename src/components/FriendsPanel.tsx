import type { Friend } from "@/types";

type FriendsPanelProps = {
  friends: Friend[];
};

export function FriendsPanel({ friends }: FriendsPanelProps) {
  const topWeekly = Math.max(...friends.map((friend) => friend.weeklyAnswered), 1);

  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-xl font-semibold text-[var(--text)]">週間ランキング</h2>
        <div className="mt-5 divide-y divide-[var(--border)]">
          {friends.map((friend, index) => (
            <div key={friend.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-4">
              <span className={`grid h-9 w-9 place-items-center rounded-md text-sm font-semibold ${friend.name === "Me" ? "bg-[var(--accent)] text-[var(--background)]" : "bg-[var(--surface)] text-[var(--subtle)]"}`}>
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-[var(--text)]">{friend.name}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface)]">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${(friend.weeklyAnswered / topWeekly) * 100}%` }} />
                </div>
              </div>
              <p className="text-right text-sm font-semibold text-[var(--subtle)]">{friend.weeklyAnswered}問</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-xl font-semibold text-[var(--text)]">学習状況比較</h2>
        <div className="mt-5 grid gap-3">
          {friends.map((friend) => (
            <div key={friend.id} className="rounded-lg bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-[var(--text)]">{friend.name}</p>
                <span className="text-sm text-[var(--muted)]">Streak {friend.streak}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <span className="text-[var(--muted)]">今週 {friend.weeklyAnswered}問</span>
                <span className="text-right text-[var(--muted)]">正答率 {friend.accuracyRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
