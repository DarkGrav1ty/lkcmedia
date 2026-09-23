import "server-only";
import { cookies } from "next/headers";
import { equal, sign } from "./security";
import { verifyPin } from "./client-auth";

export type ClientCollection = {
  id: string;
  share_token: string;
  pin_hash: string | null;
  expires_at: string | null;
  is_active: boolean;
  auth_version: string;
  downloads_enabled: boolean;
};

export function collectionActive(c: ClientCollection) {
  return c.is_active && (!c.expires_at || Date.parse(c.expires_at) > Date.now());
}
export function collectionCookie(id: string) { return `lkc_collection_${id}`; }
export function createCollectionSession(c: ClientCollection) {
  const exp = Math.min(Math.floor(Date.now()/1000)+86400, c.expires_at ? Math.floor(Date.parse(c.expires_at)/1000) : Infinity);
  const payload = `${c.id}.${c.auth_version}.${exp}`;
  return `${payload}.${sign(`collection:${payload}`)}`;
}
export async function canViewCollection(c: ClientCollection) {
  if (!collectionActive(c)) return false;
  if (!c.pin_hash) return true;
  const value = (await cookies()).get(collectionCookie(c.id))?.value;
  if (!value) return false;
  const p = value.split(".");
  if (p.length !== 4 || p[0] !== c.id || p[1] !== c.auth_version || !/^\d{10}$/.test(p[2]) || Number(p[2]) <= Date.now()/1000) return false;
  return equal(p[3], sign(`collection:${p.slice(0,3).join(".")}`));
}
export { verifyPin };
