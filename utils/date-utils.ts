import { format, isToday, isYesterday } from "date-fns";
export function parseToUtcDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();

  let normalized = dateString;
  if (!normalized.endsWith("Z") && !/[+\-]\d{2}:?\d{2}$/.test(normalized)) {
    normalized += "Z";
  }

  return new Date(normalized);
}

export function formatMessageTime(dateString: string | undefined): string {
  const date = parseToUtcDate(dateString);
  if (isNaN(date.getTime())) return "";
  return format(date, "HH:mm");
}

export function formatRelativeTime(
  dateString: string | undefined | null,
): string {
  if (!dateString) return "";
  const date = parseToUtcDate(dateString);
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Hôm qua";
  }
  return format(date, "dd/MM");
}
