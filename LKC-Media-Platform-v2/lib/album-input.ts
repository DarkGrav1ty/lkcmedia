import "server-only";
import { hashPin } from "./client-auth";
export function albumInput(body: any, existing?: any) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (
    !name ||
    name.length > 160 ||
    !["sports", "portraits"].includes(body.gallery)
  )
    throw new Error("Enter a name and gallery category.");
  const slug =
    typeof body.slug === "string"
      ? body.slug.trim()
      : name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(slug))
    throw new Error(
      "Use a short URL name containing letters, numbers and hyphens.",
    );
  if (
    typeof body.is_private !== "boolean" ||
    typeof body.is_visible !== "boolean"
  )
    throw new Error("Choose gallery visibility and access.");
  const sort_order = Number(body.sort_order || 0);
  if (!Number.isSafeInteger(sort_order) || Math.abs(sort_order) > 100000)
    throw new Error("Invalid display order.");
  const expires_at = body.expires_at
    ? new Date(body.expires_at).toISOString()
    : null;
  const event_date = body.event_date || null;
  if (
    event_date &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(event_date) ||
      new Date(event_date).toISOString().slice(0, 10) !== event_date)
  )
    throw new Error("Invalid event date.");
  let pin_hash = existing?.pin_hash || null;
  if (body.pin) {
    if (typeof body.pin !== "string" || !/^\d{6,12}$/.test(body.pin))
      throw new Error("Use a PIN of 6–12 digits.");
    pin_hash = hashPin(body.pin);
  }
  if (body.is_private && !pin_hash)
    throw new Error("Set a PIN for this private gallery.");
  return {
    name,
    slug,
    gallery: body.gallery,
    event_date,
    is_private: body.is_private,
    is_visible: body.is_visible,
    sort_order,
    expires_at,
    pin_hash,
    auth_version: crypto.randomUUID(),
  }; // Every access edit revokes earlier sessions.
}
