export default function errorHandler(error, _req, res, _next) {
  const status =
    error.status ||
    (error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: status >= 500 ? "An unexpected error occurred" : error.message,
    },
  });
}