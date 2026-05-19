import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../../lib/admin-auth";
import { supabaseAdminFetch } from "../../../../../lib/supabase-admin";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function updateProperty(propertyId, body) {
  const path = `properties?id=eq.${encodeURIComponent(propertyId)}`;

  try {
    await supabaseAdminFetch(path, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(body)
    });
    return false;
  } catch (error) {
    if (!String(error?.message || error).includes("updated_at")) {
      throw error;
    }

    const { updated_at, ...fallbackBody } = body;
    await supabaseAdminFetch(path, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(fallbackBody)
    });
    return true;
  }
}

export async function POST(request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const formData = await request.formData();
  const action = String(formData.get("_action") || "update");
  const propertyId = resolvedParams.id;

  if (action === "delete") {
    await supabaseAdminFetch(`properties?id=eq.${encodeURIComponent(propertyId)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    });
    return NextResponse.redirect(new URL("/admin?deleted=1", request.url));
  }

  const name = String(formData.get("name") || "").trim();
  const slug = slugify(String(formData.get("slug") || name));

  if (!name || !slug) {
    return NextResponse.redirect(new URL("/admin?error=property-required", request.url));
  }

  const existingProperties = await supabaseAdminFetch(
    `properties?select=id&slug=eq.${encodeURIComponent(slug)}&id=neq.${encodeURIComponent(propertyId)}&limit=1`
  );

  if (existingProperties.length > 0) {
    return NextResponse.redirect(new URL(`/admin?error=duplicate-slug&slug=${encodeURIComponent(slug)}`, request.url));
  }

  const usedSchemaFallback = await updateProperty(propertyId, {
    slug,
    name,
    address: String(formData.get("address") || "").trim(),
    service_schedule: String(formData.get("service_schedule") || "Each 3rd Thursday of the Month").trim(),
    next_service_date: String(formData.get("next_service_date") || "") || null,
    next_service_note: String(formData.get("next_service_note") || "").trim(),
    resident_fee: Number(formData.get("resident_fee") || 40),
    payable_to: "ORKIN LLC",
    notes: String(formData.get("notes") || "").trim(),
    is_active: formData.get("is_active") === "on",
    updated_at: new Date().toISOString()
  });

  return NextResponse.redirect(new URL(`/admin?updated=1${usedSchemaFallback ? "&warning=run-schema" : ""}`, request.url));
}
