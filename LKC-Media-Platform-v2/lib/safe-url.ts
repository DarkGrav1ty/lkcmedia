export function safeHref(value: unknown) {
  if (typeof value !== "string") return false;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\"))
    return true;
  if (/^#[a-zA-Z0-9_-]+$/.test(value)) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}
