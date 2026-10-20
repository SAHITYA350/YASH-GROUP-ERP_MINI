// Wraps an async route handler so any thrown error (including httpError)
// reaches the central error handler in index.js instead of crashing Node.
// Usage: router.get("/x", asyncHandler(async (req, res) => { ... }));
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
