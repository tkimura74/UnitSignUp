import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "resident_admin_session";

function sessionValue() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  return createHash("sha256").update(`resident-admin:${password}`).digest("hex");
}

export async function isAdminAuthenticated() {
  const expected = sessionValue();
  if (!expected) return false;

  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_COOKIE)?.value || "";
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function getAdminSessionValue() {
  return sessionValue();
}
