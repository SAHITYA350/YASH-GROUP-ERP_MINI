export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const label = (value) =>
  value?.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());