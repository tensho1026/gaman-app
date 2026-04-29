export const APP_TIME_ZONE = "Asia/Tokyo";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getDateKey(date = new Date(), timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not format date key");
  }

  return `${year}-${month}-${day}`;
}

export function keyToUtcDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDaysToKey(dateKey: string, days: number) {
  const date = keyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-");
}

export function getRecentDateKeys(todayKey: string, length: number) {
  return Array.from({ length }, (_, index) => addDaysToKey(todayKey, -index));
}

export function daysInclusive(fromKey: string, toKey: string) {
  const from = keyToUtcDate(fromKey).getTime();
  const to = keyToUtcDate(toKey).getTime();
  return Math.max(1, Math.floor((to - from) / DAY_MS) + 1);
}

export function formatDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(keyToUtcDate(dateKey));
}
