import { useState } from "react";
import { LeetCodeUser, LeaderboardPeriod, getSubmissionsInPeriod } from "@/lib/leetcode-api";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardProps {
  users: LeetCodeUser[];
}

const rankIcons = [
  <Trophy className="h-5 w-5 text-accent" />,
  <Medal className="h-5 w-5 text-muted-foreground" />,
  <Award className="h-5 w-5 text-medium" />,
];

const periods: { value: LeaderboardPeriod; label: string }[] = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
  { value: "total", label: "All Time" },
];

export function Leaderboard({ users }: LeaderboardProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("total");

  const usersWithPeriodCount = users.map((user) => ({
    ...user,
    periodCount:
      period === "total"
        ? user.solvedStats.all
        : getSubmissionsInPeriod(user.submissionCalendar ?? {}, period),
  }));

  const sorted = [...usersWithPeriodCount].sort((a, b) => b.periodCount - a.periodCount);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Trophy className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">Add users to see the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex rounded-lg bg-secondary p-1 w-fit">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === p.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-primary uppercase tracking-wider">
                {period === "total" ? "Total Solved" : "Submissions"}
              </th>
              {period === "total" && (
                <>
                  <th className="px-4 py-3 text-center text-xs font-medium text-easy uppercase tracking-wider">Easy</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-medium uppercase tracking-wider">Medium</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-hard uppercase tracking-wider">Hard</th>
                </>
              )}
              <th className="px-4 py-3 text-center text-xs font-medium text-accent uppercase tracking-wider">🔥 Streak</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user, i) => (
              <tr
                key={user.username}
                className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center">
                    {i < 3 ? rankIcons[i] : <span className="font-mono text-sm text-muted-foreground">{i + 1}</span>}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {user.profile.userAvatar ? (
                      <img src={user.profile.userAvatar} alt="" className="h-8 w-8 rounded-full ring-1 ring-border" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 font-mono text-xs font-bold text-primary">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground text-sm">{user.username}</p>
                      {user.profile.ranking > 0 && (
                        <p className="text-xs text-muted-foreground">#{user.profile.ranking.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-center font-mono font-bold text-primary">{user.periodCount}</td>
                {period === "total" && (
                  <>
                    <td className="px-4 py-3.5 text-center font-mono text-sm text-easy">{user.solvedStats.easy}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-sm text-medium">{user.solvedStats.medium}</td>
                    <td className="px-4 py-3.5 text-center font-mono text-sm text-hard">{user.solvedStats.hard}</td>
                  </>
                )}
                <td className="px-4 py-3.5 text-center font-mono text-sm font-semibold text-accent">
                  {user.streak > 0 ? user.streak : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
