// Validation helpers for request bodies
// Returns an array of missing field names (empty if all present)
export function missingFields(obj, required) {
  const missing = [];
  for (const field of required) {
    if (obj[field] === undefined || obj[field] === null || obj[field] === "") {
      missing.push(field);
    }
  }
  return missing;
}

export default { missingFields };
