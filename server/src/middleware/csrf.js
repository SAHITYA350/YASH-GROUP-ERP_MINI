import { fail } from "../utils/http.js";

export default function csrf(req, _res, next) {
  if (
    ["GET", "HEAD", "OPTIONS"].includes(req.method) ||
    req.get("x-csrf-token") === req.cookies.yash_csrf
  ) {
    return next();
  }
  return next(fail(403, "Invalid CSRF token", "CSRF_INVALID"));
}