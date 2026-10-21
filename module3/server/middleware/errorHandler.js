/**
 * Shared Error Handling Middleware for Module 3
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error occurred";

  console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}:`, err);

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
