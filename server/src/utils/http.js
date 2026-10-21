export const fail = (status, message, code = "REQUEST_FAILED") =>
  Object.assign(new Error(message), { status, code });

export const parse = (schema, input) => {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw fail(400, "Validation failed", "VALIDATION_ERROR");
  }
  return result.data;
};

export const serialise = (value) =>
  JSON.parse(
    JSON.stringify(value, (_, item) =>
      typeof item === "bigint" ? item.toString() : item,
    ),
  );

export const paged = (page, pageSize, total, data) => ({
  data: serialise(data),
  meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
});