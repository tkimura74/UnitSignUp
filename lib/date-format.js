export const HAWAII_TIME_ZONE = "Pacific/Honolulu";

export function formatHawaiiDate(dateValue, fallback = "Not set") {
  if (!dateValue) return fallback;

  const date = new Date(`${dateValue}T00:00:00-10:00`);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: HAWAII_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatHawaiiDateTime(dateValue, fallback = "") {
  if (!dateValue) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: HAWAII_TIME_ZONE,
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short"
  }).format(new Date(dateValue));
}
