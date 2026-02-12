


import { ReactElement, useEffect, useMemo, useRef } from "react";

interface SubmissionCalendarProps {
  submissionCalendar: Record<string, number>;
  username: string;
}

export function SubmissionCalendar({ submissionCalendar, username }: SubmissionCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  const { weeks, maxCount } = useMemo(() => {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 364); // ~52 weeks

    const dayOfWeek = startDate.getDay();
    if (dayOfWeek !== 0) {
      startDate.setDate(startDate.getDate() - dayOfWeek);
    }

    const weeks: Array<Array<{ date: Date; count: number }>> = [];
    let currentWeek: Array<{ date: Date; count: number }> = [];
    let maxCount = 0;

    const current = new Date(startDate);
    while (current <= endDate) {
      // Create a UTC midnight timestamp for matching
      const utcDate = new Date(Date.UTC(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        0, 0, 0, 0
      ));
      const timestamp = Math.floor(utcDate.getTime() / 1000);
      const count = submissionCalendar[timestamp.toString()] || 0;

      if (count > maxCount) maxCount = count;

      currentWeek.push({
        date: new Date(current),
        count,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, maxCount };
  }, [submissionCalendar]);

  const getColorClass = (count: number): string => {
    if (count === 0) return "bg-secondary";
    if (maxCount === 0) return "bg-secondary";

    const ratio = count / maxCount;
    if (ratio >= 0.75) return "bg-primary";
    if (ratio >= 0.5) return "bg-primary/70";
    if (ratio >= 0.25) return "bg-primary/40";
    return "bg-primary/20";
  };

  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
      const firstDay = week[0];
      const month = firstDay.date.getMonth();

      if (month !== lastMonth) {
        labels.push({
          month: firstDay.date.toLocaleDateString("en-US", { month: "short" }),
          weekIndex: index,
        });
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.scrollLeft = calendarRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Submissions in the last year</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-secondary" />
            <div className="h-2.5 w-2.5 rounded-sm bg-primary/20" />
            <div className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
            <div className="h-2.5 w-2.5 rounded-sm bg-primary/70" />
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div ref={calendarRef} className="overflow-x-auto pb-1">
        {/* Month labels - inside scrollable container */}
        <div className="mb-1 flex gap-[3px]">
          {weeks.map((week, index) => {
            const monthLabel = monthLabels.find(label => label.weekIndex === index);
            return (
              <div key={index} className="w-[11px] flex-shrink-0">
                {monthLabel && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {monthLabel.month}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px] flex-shrink-0">
              {week.map((day, dayIndex) => {
                const isToday =
                  day.date.toDateString() === new Date().toDateString();
                const dateStr = day.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={dayIndex}
                    className={`h-[11px] w-[11px] rounded-[2px] ${getColorClass(
                      day.count
                    )} transition-all hover:ring-2 hover:ring-primary/50`}
                    title={`${day.count} submissions on ${dateStr}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

