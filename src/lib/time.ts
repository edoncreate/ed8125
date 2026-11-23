const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Lisbon",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** HH:MM, 24h, in Europe/Lisbon. */
export function formatLisbonTime(d: Date): string {
  return clock.format(d);
}

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "2025-07-25" → "25 Jul 2025" */
export function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return day.format(new Date(Date.UTC(y, m - 1, d)));
}
