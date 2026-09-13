import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "lkc_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function secret() {
    return process.env.ADMIN_PASSWORD || "";
}

function signature(expires: string) {
    return crypto.createHmac("sha256", secret()).update(expires).digest("hex");
}

export function createAdminSessionValue() {
    const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
    return `${expires}.${signature(expires)}`;
}

export function verifyAdminSessionValue(value?: string) {
    if (!value || !secret()) return false;
    const [expires, supplied] = value.split(".");
    if (!expires || !supplied || Number(expires) < Math.floor(Date.now() / 1000)) return false;
    const expected = signature(expires);
    if (expected.length !== supplied.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

export async function isAdminAuthenticated() {
    const store = await cookies();
    return verifyAdminSessionValue(store.get(COOKIE_NAME)?.value);
}

export const adminCookie = {
    name: COOKIE_NAME,
    maxAge: SESSION_SECONDS,
};
