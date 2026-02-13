import { LeetCodeUser, getDaysAgo } from "@/lib/leetcode-api";
import { X, RefreshCw, ExternalLink, Flame, CheckCircle2, ClipboardX } from "lucide-react";
import { SubmissionCalendar } from "./Calendar";
import { formatRemaining, formatTimeAgo } from "@/lib/time";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UserCardProps {
  user: LeetCodeUser;
  onRemove: (username: string) => void;
  onRefresh: (username: string) => void;
}

export function UserCard({ user, onRemove, onRefresh }: UserCardProps) {
  const { solvedStats, profile, recentSubmissions, lastFetched } = user;
  const [now, setNow] = useState(() => Date.now());
  const { toast } = useToast();

  const COOLDOWN_MS = 1 * 60 * 1000;

  const refreshWithCooldown = () => {
    const now = Date.now();

    const blocked = now - lastFetched < COOLDOWN_MS;

    if (blocked) {
      const remaining = COOLDOWN_MS - (now - lastFetched);

      toast({ title: "Refresh limit reached", description: `Please wait ${formatRemaining(remaining)} before refreshing again.` });
      return;
    }

    onRefresh(user.username);
  };

  const totalQuestions = { easy: 925, medium: 2005, hard: 907 }

  const easyPct = solvedStats.easy ? solvedStats.easy / totalQuestions.easy * 100 : 0;
  const medPct = solvedStats.medium ? solvedStats.medium / totalQuestions.medium * 100 : 0;
  const hardPct = solvedStats.hard ? solvedStats.hard / totalQuestions.hard * 100 : 0;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000); // update every minute
    return () => clearInterval(id);
  }, []);

  const recentFive = [...new Set(recentSubmissions)]?.slice(0, 5) || [];

  const lastUpdatedText =
    user.lastFetched ? formatTimeAgo(user.lastFetched, now, { compact: false, alwaysShowMinutes: true }) : "—";

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        {profile.userAvatar ? (
          <img
            src={profile.userAvatar}
            alt={user.username}
            className="h-10 w-10 rounded-full ring-2 ring-primary/20"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 font-mono text-sm font-bold text-primary">
            {user.username[0].toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{user.username}</h3>
            <a
              href={`https://leetcode.com/u/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          {profile.ranking > 0 && (
            <p className="text-xs text-muted-foreground">Rank #{profile.ranking.toLocaleString()}</p>
          )} <span className="text-muted-foreground/40 border-t h-1 border-t-muted"></span>
          <p className="text-[10px] text-muted-foreground">
            Last updated {lastUpdatedText}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => refreshWithCooldown()}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onRemove(user.username)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-4 flex items-center justify-center gap-6">
        <div className="text-center">
          <span className="font-mono text-3xl font-bold text-primary">{solvedStats.all}</span>
          <span className="text-sm text-muted-foreground"> / {3837}</span>
          <p className="text-xs text-muted-foreground mt-0.5">Solved</p>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className={`h-5 w-5 ${user.streak > 0 ? "text-accent" : "text-muted-foreground/40"}`} />
            <span className={`font-mono text-2xl font-bold ${user.streak > 0 ? "text-accent" : "text-muted-foreground/40"}`}>{user.streak}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Day Streak</p>
        </div>
      </div>

      {/* Difficulty breakdown */}
      <div className="space-y-2.5">
        <DifficultyBar label="Easy" solved={solvedStats.easy} total={totalQuestions.easy} pct={easyPct} color="bg-easy" />
        <DifficultyBar label="Medium" solved={solvedStats.medium} total={totalQuestions.medium} pct={medPct} color="bg-medium" />
        <DifficultyBar label="Hard" solved={solvedStats.hard} total={totalQuestions.hard} pct={hardPct} color="bg-hard" />
      </div>

      <SubmissionCalendar
        submissionCalendar={user.submissionCalendar}
        username={user.username}
      />

      {/* Recent Submissions */}
      {recentFive.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Recent Accepted Submissions
          </h4>
          <div className="space-y-1.5">
            {recentFive.map((submission, index) => {
              const daysAgo = getDaysAgo(submission.timestamp);
              const timeText = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

              return (
                <a
                  key={`${submission.titleSlug}-${index}`}
                  href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 transition-colors group/item"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-easy flex-shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1 group-hover/item:text-primary">
                    {submission.title}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {timeText}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      ) : (<div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Recent Accepted Submissions
        </h4>
        <div className="py-8 flex h-full flex-col items-center justify-center gap-2">
          <ClipboardX className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">No Recent Accepted Submissions</span>
        </div>
      </div>)}
    </div>
  );
}

function DifficultyBar({ label, solved, total, pct, color }: { label: string; solved: number; total: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-14 text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-muted-foreground w-16 text-right">
        {solved}<span className="text-muted-foreground/50">/{total}</span>
      </span>
    </div>
  );
}
