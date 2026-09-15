import "server-only";
import { cookies } from "next/headers";
import { equal, sign } from "./security";
const SESSION_SECONDS = 60 * 60 * 12;
export const adminCookie = {
  name: "lkc_admin_session",
  maxAge: SESSION_SECONDS,
};
export function createAdminSessionValue() {
  const expiry = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expiry}.${sign(`admin:${expiry}:${process.env.ADMIN_PASSWORD}`)}`;
}
export function verifyAdminSessionValue(value?: string) {
  if (!value || !process.env.ADMIN_PASSWORD) return false;
  const parts = value.split(".");
  if (parts.length !== 2 || !/^\d{10}$/.test(parts[0])) return false;
  const expires = Number(parts[0]);
  if (
    expires <= Date.now() / 1000 ||
    expires > Date.now() / 1000 + SESSION_SECONDS
  )
    return false;
  try {
    return equal(
      parts[1],
      sign(`admin:${parts[0]}:${process.env.ADMIN_PASSWORD}`),
    );
  } catch {
    return false;
  }
}
export async function isAdminAuthenticated() {
  return verifyAdminSessionValue(
    (await cookies()).get(adminCookie.name)?.value,
  );
}
