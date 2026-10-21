import crypto from "node:crypto";

export const makeCode = (prefix) =>
  `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;