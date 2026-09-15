import "server-only";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { equal, sign } from "./security";
export type AccessAlbum = {
  id: string;
  is_visible: boolean;
  is_private: boolean;
  expires_at: string | null;
  auth_version: string;
};
export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}.${pbkdf2Sync(pin, salt, 100000, 32, "sha256").toString("hex")}`;
}
export function verifyPin(pin: string, hash: string) {
  const [salt, digest] = hash.split(".");
  if (!salt || !digest) return false;
  return equal(
    pbkdf2Sync(pin, salt, 100000, 32, "sha256").toString("hex"),
    digest,
  );
}
export function activeAlbum(album: AccessAlbum) {
  return (
    album.is_visible &&
    (!album.expires_at || Date.parse(album.expires_at) > Date.now())
  );
}
export function clientCookie(id: string) {
  return `lkc_client_${id}`;
}
export function createClientSession(album: AccessAlbum) {
  const expiry = Math.min(
    Math.floor(Date.now() / 1000) + 3600,
    album.expires_at
      ? Math.floor(Date.parse(album.expires_at) / 1000)
      : Infinity,
  );
  const payload = `${album.id}.${album.auth_version}.${expiry}`;
  return `${payload}.${sign(`client:${payload}`)}`;
}
export async function canViewAlbum(album: AccessAlbum) {
  if (!activeAlbum(album)) return false;
  if (!album.is_private) return true;
  const value = (await cookies()).get(clientCookie(album.id))?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (
    parts.length !== 4 ||
    parts[0] !== album.id ||
    parts[1] !== album.auth_version ||
    !/^\d{10}$/.test(parts[2]) ||
    Number(parts[2]) <= Date.now() / 1000
  )
    return false;
  return equal(parts[3], sign(`client:${parts.slice(0, 3).join(".")}`));
}
