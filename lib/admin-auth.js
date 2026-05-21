import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "resident_admin_session";

function sessionValue(role, password) {
  if (!password) return "";
  return createHash("sha256").update(`resident-admin:${role}:${password}`).digest("hex");
}

export async function getAdminRole() {
  const cookieStore = await cookies();
  const actual = cookieStore.get(ADMIN_COOKIE)?.value || "";

  const sessions = [
    { role: "super", value: sessionValue("super", process.env.SUPER_ADMIN_PASSWORD) },
    { role: "admin", value: sessionValue("admin", process.env.ADMIN_PASSWORD) }
  ].filter((session) => session.value);

  return sessions.find((session) => {
    if (actual.length !== session.value.length) return false;
    return timingSafeEqual(Buffer.from(actual), Buffer.from(session.value));
  })?.role || "";
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminRole());
}

export function getAdminSessionForPassword(password) {
  if (process.env.SUPER_ADMIN_PASSWORD && password === process.env.SUPER_ADMIN_PASSWORD) {
    return {
      role: "super",
      value: sessionValue("super", process.env.SUPER_ADMIN_PASSWORD)
    };
  }

  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    return {
      role: "admin",
      value: sessionValue("admin", process.env.ADMIN_PASSWORD)
    };
  }

  return null;
}
