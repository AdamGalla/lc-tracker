type TimeAgoOptions = {
  alwaysShowMinutes?: boolean;
  compact?: boolean;
};

export function formatTimeAgo(fromMs: number, nowMs: number = Date.now(), opts: TimeAgoOptions = {}) {
  const { alwaysShowMinutes = true, compact = false } = opts;

  let diff = Math.max(0, nowMs - fromMs);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  const days = Math.floor(diff / day);
  diff -= days * day;

  const hours = Math.floor(diff / hour);
  diff -= hours * hour;

  const mins = Math.floor(diff / minute);

  const parts: string[] = [];

  if (days > 0) parts.push(compact ? `${days}d` : `${days} day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(compact ? `${hours}h` : `${hours} hour${hours === 1 ? "" : "s"}`);

  if (alwaysShowMinutes || mins > 0 || parts.length === 0) {
    parts.push(compact ? `${mins}m` : `${mins} min${mins === 1 ? "" : "s"}`);
  }

  return `${parts.join(compact ? " " : " ")} ago`;
}

export function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
