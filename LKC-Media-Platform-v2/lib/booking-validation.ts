import { POLICY_VERSION } from "./site";
export function validateBooking(b: any) {
  if (
    b.termsAccepted !== true ||
    b.mediaPolicyAccepted !== true ||
    b.policyVersion !== POLICY_VERSION
  )
    return "Accept the current terms and photo usage policy before submitting.";
  for (const [key, max] of [
    ["name", 120],
    ["email", 254],
    ["details", 4000],
  ] as const)
    if (typeof b[key] !== "string" || !b[key].trim() || b[key].length > max)
      return "Enter a name, valid email and session details within the field limits.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) || /[\r\n]/.test(b.email))
    return "Enter a valid email address.";
  if (!["Sports", "Portraits"].includes(b.shootType))
    return "Choose a shoot type.";
  if (
    typeof b.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
    !Number.isFinite(Date.parse(b.date)) ||
    new Date(b.date).toISOString().slice(0, 10) !== b.date
  )
    return "Choose a valid date.";
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  if (b.date < today) return "Choose today or a future date.";
  for (const k of ["instagram", "sport", "package"])
    if (b[k] != null && (typeof b[k] !== "string" || b[k].length > 160))
      return "An optional field is too long.";
  const l = b.location;
  if (
    !l ||
    typeof l.name !== "string" ||
    !l.name.trim() ||
    l.name.length > 200 ||
    typeof l.address !== "string" ||
    !l.address.trim() ||
    l.address.length > 500
  )
    return "Enter a shoot location.";
  if ((l.latitude == null) !== (l.longitude == null))
    return "Location coordinates are incomplete.";
  if (
    l.latitude != null &&
    (!Number.isFinite(l.latitude) ||
      !Number.isFinite(l.longitude) ||
      Math.abs(l.latitude) > 90 ||
      Math.abs(l.longitude) > 180)
  )
    return "Invalid location coordinates.";
  if (b.mediaConsent !== undefined && typeof b.mediaConsent !== "boolean")
    return "Invalid photo preference.";
  return null;
}
