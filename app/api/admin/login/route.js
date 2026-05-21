import { NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionForPassword } from "../../../../lib/admin-auth";

export async function POST(request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (!process.env.ADMIN_PASSWORD && !process.env.SUPER_ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login?error=missing-config", request.url));
  }

  const session = getAdminSessionForPassword(password);

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  return response;
}
