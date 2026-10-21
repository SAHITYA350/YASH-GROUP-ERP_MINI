<<<<<<< HEAD
export function fmtDate(value) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
}

export function fmtDateTime(value) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
}

export function dateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
=======
export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const label = (value) =>
  value?.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
>>>>>>> origin/dev
