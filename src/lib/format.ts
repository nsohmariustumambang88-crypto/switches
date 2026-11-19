const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function money(n: number) {
  return usd.format(n);
}

// Fixed locale + time zone so server and client render identical strings.
const day = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const time = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDay(iso: string) {
  return day.format(new Date(iso));
}

export function formatDayTime(iso: string) {
  const d = new Date(iso);
  return `${day.format(d)}, ${time.format(d)}`;
}
