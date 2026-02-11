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
  lastFetched: number;
}

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "total";

export function getSubmissionsInPeriod(
  calendar: Record<string, number>,
  period: LeaderboardPeriod
): number {
  if (period === "total") return -1; // signal to use solvedStats.all instead

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
  const [profileRes, solvedRes, calendarRes] = await Promise.all([
    fetch(`${API_BASE}/${username}`),
    fetch(`${API_BASE}/${username}/solved`),
    fetch(`${API_BASE}/${username}/calendar`),
  ]);

  if (!profileRes.ok) throw new Error(`User "${username}" not found`);
  if (!solvedRes.ok) throw new Error(`Could not fetch solved stats for "${username}"`);

  const profile = await profileRes.json();
  const solved = await solvedRes.json();
  const calendar = calendarRes.ok ? await calendarRes.json() : {};

  if (!profile.username && !profile.matchedUser) {
    throw new Error(`User "${username}" not found on LeetCode`);
  }

  const easySolved = solved.easySolved ?? 0;
  const mediumSolved = solved.mediumSolved ?? 0;
  const hardSolved = solved.hardSolved ?? 0;

  let submissionCalendar: Record<string, number> = {};
  if (calendar.submissionCalendar) {
    submissionCalendar =
      typeof calendar.submissionCalendar === "string"
        ? JSON.parse(calendar.submissionCalendar)
        : calendar.submissionCalendar;
  }

  return {
    username: profile.username ?? username,
    profile: {
      realName: profile.name ?? username,
      userAvatar: profile.avatar ?? "",
      ranking: profile.ranking ?? 0,
    },
    solvedStats: {
      all: solved.solvedProblem ?? easySolved + mediumSolved + hardSolved,
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
    },
    totalQuestions: {
      all: solved.totalProblem ?? 0,
      easy: solved.totalEasy ?? 0,
      medium: solved.totalMedium ?? 0,
      hard: solved.totalHard ?? 0,
    },
    streak: calculateStreak(submissionCalendar),
    submissionCalendar,
    lastFetched: Date.now(),
  };
}
