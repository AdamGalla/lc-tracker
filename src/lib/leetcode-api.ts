export interface LeetCodeSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface LeetCodeUser {
  username: string;
  profile: {
    realName: string;
    userAvatar: string;
    ranking: number;
  };
  solvedStats: {
    all: number;
    easy: number;
    medium: number;
    hard: number;
  };
  totalQuestions: {
    all: number;
    easy: number;
    medium: number;
    hard: number;
  };
  streak: number;
  submissionCalendar: Record<string, number>;
  recentSubmissions: LeetCodeSubmission[];
  rateLimit?: RateLimitInfo;
  lastFetched: number;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  weekLabel: string;
  userSubmissions: {
    username: string;
    count: number;
    avatar: string;
    problems: string[];
  }[];
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetTime: Date;
}


export class RateLimitError extends Error {
  readonly status = 429 as const;

  constructor(message = "Rate limit exceeded", public rateLimit?: RateLimitInfo) {
    super(message);
    this.name = "RateLimitError";
  }
}

export function isRateLimitError(err: unknown): err is RateLimitError {
  return err instanceof RateLimitError;
}


export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "total";

function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const rateLimitHeader = headers.get('ratelimit');
  if (!rateLimitHeader) return undefined;

  const parts = rateLimitHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.trim().split('=');
    acc[key] = parseInt(value);
    return acc;
  }, {} as Record<string, number>);

  return {
    limit: parts.limit || 0,
    remaining: parts.remaining || 0,
    reset: parts.reset || 0,
    resetTime: new Date(Date.now() + (parts.reset * 1000)),
  };
}

export function getSubmissionsInPeriod(
  calendar: Record<string, number>,
  period: LeaderboardPeriod
): number {
  if (period === "total") return -1;

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  const cutoff = new Date(now);
  if (period === "daily") {
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    cutoff.setDate(cutoff.getDate() - 7);
    cutoff.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    cutoff.setDate(cutoff.getDate() - 30);
    cutoff.setHours(0, 0, 0, 0);
  }

  const cutoffTs = Math.floor(cutoff.getTime() / 1000);
  let total = 0;
  for (const [timestamp, count] of Object.entries(calendar)) {
    if (Number(timestamp) >= cutoffTs && count > 0) {
      total += count;
    }
  }
  return total;
}

export function getDaysAgo(timestamp: string | number): number {
  const submissionDate = new Date(Number(timestamp) * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  submissionDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - submissionDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const API_BASE = "https://alfa-leetcode-api.onrender.com";

function calculateStreak(submissionCalendar: Record<string, number>): number {
  if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeDays = new Set<string>();
  for (const [timestamp, count] of Object.entries(submissionCalendar)) {
    if (count > 0) {
      const d = new Date(Number(timestamp) * 1000);
      d.setHours(0, 0, 0, 0);
      activeDays.add(d.toISOString().slice(0, 10));
    }
  }

  let streak = 0;
  const check = new Date(today);
  const todayStr = check.toISOString().slice(0, 10);

  if (!activeDays.has(todayStr)) {
    check.setDate(check.getDate() - 1);
  }

  while (true) {
    const key = check.toISOString().slice(0, 10);
    if (activeDays.has(key)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}


export async function fetchLeetCodeUser(username: string): Promise<LeetCodeUser> {
  try {
    const response = await fetch(`/api/leetcode?username=${username}`);

    if (!response.ok) {
      if (response.status === 429) {
        throw new RateLimitError('Rate limit exceeded. Please try again in few minutes.');
      }
      throw new Error(`Failed to fetch data for "${username}"`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data; // Already in LeetCodeUser format!
  } catch (err: any) {
    if (err.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }
    throw err;
  }
}


export function getWeeklyHistory(users: LeetCodeUser[]): WeeklyStats[] {
  const weekMap = new Map<string, Map<string, Set<string>>>();

  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const now = new Date();
  const currentMonday = getMonday(now);
  const weeksToShow = 2;

  for (let i = 0; i < weeksToShow; i++) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekKey = weekStart.toISOString().split('T')[0];
    weekMap.set(weekKey, new Map());
  }

  users.forEach((user) => {
    if (!user.recentSubmissions) return;

    user.recentSubmissions.forEach((sub) => {
      const date = new Date(Number(sub.timestamp) * 1000);
      const monday = getMonday(date);
      const weekKey = monday.toISOString().split('T')[0];

      if (weekMap.has(weekKey)) {
        const weekData = weekMap.get(weekKey)!;
        if (!weekData.has(user.username)) {
          weekData.set(user.username, new Set());
        }
        weekData.get(user.username)!.add(sub.titleSlug);
      }
    });
  });

  const weeks = Array.from(weekMap.entries())
    .map(([weekKey, userData]) => {
      const weekStart = new Date(weekKey);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const userSubmissions = users.map((user) => {
        const problems = userData.get(user.username);
        return {
          username: user.username,
          count: problems ? problems.size : 0,
          avatar: user.profile.userAvatar,
          problems: problems ? Array.from(problems) : [],
        };
      });

      userSubmissions.sort((a, b) => b.count - a.count);

      const formatDate = (d: Date) =>
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        weekStart,
        weekEnd,
        weekLabel: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
        userSubmissions,
      };
    })
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());

  return weeks;
}
