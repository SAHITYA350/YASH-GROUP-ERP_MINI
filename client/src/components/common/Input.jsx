export default function Input({
  name,
  type = "text",
  value,
  placeholder,
  required,
  min,
  step,
  options,
  disabled,
}) {
  if (options)
    return (
      <select
        name={name}
        defaultValue={value || ""}
        required={required}
        disabled={disabled}
      >
        <option value="">Select…</option>
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
    );
  if (type === "textarea")
    return (
      <textarea
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        required={required}
        rows="3"
      />
    );
  return (
    <input
      name={name}
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
      disabled={disabled}
    />
  );
}
