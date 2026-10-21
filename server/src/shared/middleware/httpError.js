const prismaCode = (error) =>
  typeof error?.code === "string" ? error.code : "";
const prismaInputCodes = new Set([
  "P2000",
  "P2005",
  "P2006",
  "P2007",
  "P2009",
  "P2011",
  "P2012",
  "P2013",
  "P2014",
  "P2019",
  "P2020",
]);

export const errorStatus = (error, fallback = 400) => {
  const code = prismaCode(error);
  if (code === "P2025" || /not found/i.test(error?.message || "")) return 404;
  if (["P2002", "P2003"].includes(code)) return 409;
  if (prismaInputCodes.has(code)) return 400;
  if (
    ["P2021", "P2022", "P2024"].includes(code) ||
    /^P10(?:0[0-9]|1[0-7])$/.test(code)
  )
    return 503;
  if (code.startsWith("P")) return 500;
  if (
    Number.isInteger(error?.status) &&
    error.status >= 400 &&
    error.status <= 599
  )
    return error.status;
  return fallback;
};

export const errorMessage = (error) => {
  const code = prismaCode(error);
  if (/^P10(?:0[0-9]|1[0-7])$/.test(code) || code === "P2024")
    return "Database service is unavailable.";
  if (code === "P2021" || code === "P2022")
    return "Database schema does not match the Prisma client. Check /api/ready and reconcile the migration history before applying changes.";
  if (code === "P2025" || /not found/i.test(error?.message || ""))
    return error.message;
  if (code === "P2002") return "A record with these details already exists.";
  if (code === "P2003") return "This change conflicts with a related record.";
  if (prismaInputCodes.has(code))
    return "The request contains invalid or incomplete data.";
  if (code.startsWith("P")) return "Database request failed.";
  return error?.message || "Request failed.";
};
