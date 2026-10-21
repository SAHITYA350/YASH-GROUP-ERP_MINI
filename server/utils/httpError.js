// Shared HTTP error helper.
// Throw httpError(404, "Invoice not found") anywhere in a service/controller;
// the central error handler in index.js turns it into a JSON response.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export default httpError;
