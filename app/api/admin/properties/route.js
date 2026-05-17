import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { supabaseAdminFetch } from "../../../../lib/supabase-admin";
import { randomUUID } from "node:crypto";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));

  if (!name || !slug) {
    return NextResponse.redirect(new URL("/admin?error=property-required", request.url));
  }

  await supabaseAdminFetch("properties", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      slug,
      name,
      address: String(formData.get("address") || "").trim(),
      service_schedule: String(formData.get("service_schedule") || "Each 3rd Thursday of the Month").trim(),
      next_service_date: String(formData.get("next_service_date") || "") || null,
      next_service_note: String(formData.get("next_service_note") || "").trim(),
      technician_token: randomUUID(),
      resident_fee: Number(formData.get("resident_fee") || 40),
      payable_to: "ORKIN LLC",
      notes: String(formData.get("notes") || "").trim(),
      is_active: formData.get("is_active") === "on"
    })
  });

  return NextResponse.redirect(new URL("/admin?created=1", request.url));
}
