import { useState, useEffect } from "react";
import { LeetCodeUser, getWeeklyHistory, WeeklyStats } from "@/lib/leetcode-api";
import { Trophy, Medal, Award, ChevronDown, ChevronUp, Calendar, Clock } from "lucide-react";

interface WeeklyChallengeProps {
  users: LeetCodeUser[];
}

const rankIcons = [
  <Trophy className="h-4 w-4 text-accent" />,
  <Medal className="h-4 w-4 text-muted-foreground" />,
  <Award className="h-4 w-4 text-medium" />,
];

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

interface WeekCardProps {
  week: WeeklyStats;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
}

function WeekCard({ week, index, isExpanded, onToggle }: WeekCardProps) {
  const now = new Date();
  const isCurrent = now >= week.weekStart && now <= week.weekEnd;
  const winner = week.userSubmissions[0];
  const countdown = useCountdown(week.weekEnd);

  // Count users with actual submissions
  const activeUsers = week.userSubmissions.filter(u => u.count > 0).length;
  const totalUsers = week.userSubmissions.length;

  return (
    <div
      className={`rounded-xl border transition-colors ${isCurrent
        ? "border-primary/50 bg-primary/5"
        : "border-border bg-card"
        }`}
    >
      {/* Week Header */}
      <button
        onClick={() => onToggle(index)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm text-foreground">
                {week.weekLabel}
              </p>
              {isCurrent && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  In Progress
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {isCurrent && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Ends in {countdown}
                </p>
              )}
              {winner && winner.count > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {isCurrent ? "🔥" : "🏆"} {winner.username} • {winner.count} problem{winner.count !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No submissions yet
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeUsers}/{totalUsers} active
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Week Details */}
      {isExpanded && (
        <div className="border-t border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                  Rank
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-primary uppercase tracking-wider">
                  Accepted Submissions
                </th>
              </tr>
            </thead>
            <tbody>
              {week.userSubmissions.map((userStat, rank) => (
                <tr
                  key={userStat.username}
                  className={`border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors ${userStat.count === 0 ? "opacity-60" : ""
                    }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center">
                      {rank < 3 && userStat.count > 0 ? (
                        rankIcons[rank]
                      ) : (
                        <span className="font-mono text-sm text-muted-foreground">
                          {rank + 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {userStat.avatar ? (
                        <img
                          src={userStat.avatar}
                          alt=""
                          className="h-7 w-7 rounded-full ring-1 ring-border"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 font-mono text-xs font-bold text-primary">
                          {userStat.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-sm text-foreground">
                        {userStat.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {userStat.count > 0 ? (
                      <span className="font-mono font-bold text-primary">
                        {userStat.count}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No submissions
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function WeeklyChallenge({ users }: WeeklyChallengeProps) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0]));
  const weeklyHistory = getWeeklyHistory(users);

  const toggleWeek = (index: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedWeeks(newExpanded);
  };

  if (weeklyHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Calendar className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm">No submission history available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weeklyHistory.map((week, index) => (
        <WeekCard
          key={week.weekStart.toISOString()}
          week={week}
          index={index}
          isExpanded={expandedWeeks.has(index)}
          onToggle={toggleWeek}
        />
      ))}
    </div>
  );
}
