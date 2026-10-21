export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
};

export const errorHandler = (error, req, res, _next) => {
  console.error("[ERROR]", error.stack || error.message);
  const status =
    error.status || (error.type === "entity.parse.failed" ? 400 : 500);
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Internal server error." : error.message,
  });
};
