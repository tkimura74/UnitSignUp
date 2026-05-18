import { NextResponse } from "next/server";
import { supabaseAdminFetch } from "../../../lib/supabase-admin";

async function verifyTurnstile(token, request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };

  if (!token) {
    return { ok: false, message: "Complete the verification check before submitting." };
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("remoteip", request.headers.get("cf-connecting-ip") || "");

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  }).catch(() => null);

  if (!response) {
    return { ok: false, message: "Verification could not be completed. Please try again." };
  }

  const result = await response.json().catch(() => null);

  if (!result?.success) {
    return { ok: false, message: "Verification failed. Please try again." };
  }

  return { ok: true };
}

export async function POST(request) {
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (String(payload.companyName || "").trim()) {
    return NextResponse.json({ error: "Unable to save this request." }, { status: 400 });
  }

  const verification = await verifyTurnstile(payload.turnstileToken, request);
  if (!verification.ok) {
    return NextResponse.json({ error: verification.message }, { status: 400 });
  }

  const requiredFields = [
    payload.propertyId,
    payload.residentName,
    payload.unitNumber,
    payload.phoneNumber,
    payload.paymentAcknowledged
  ];

  if (requiredFields.some((field) => !field)) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const phoneNumber = String(payload.phoneNumber).trim();
  if (!/^[0-9+() .-]{7,}$/.test(phoneNumber)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  const residentName = String(payload.residentName).trim();
  const unitNumber = String(payload.unitNumber).trim();

  if (residentName.length > 120 || unitNumber.length > 40 || phoneNumber.length > 30) {
    return NextResponse.json({ error: "One or more fields are too long." }, { status: 400 });
  }

  const properties = await supabaseAdminFetch(
    `properties?select=id,next_service_date&id=eq.${encodeURIComponent(payload.propertyId)}&is_active=eq.true&limit=1`
  );
  const property = properties[0];

  if (!property) {
    return NextResponse.json({ error: "This signup page is not active." }, { status: 400 });
  }

  await supabaseAdminFetch("submissions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      property_id: payload.propertyId,
      service_date: property.next_service_date || null,
      resident_name: residentName,
      unit_number: unitNumber,
      phone_number: phoneNumber,
      payment_acknowledged: Boolean(payload.paymentAcknowledged)
    })
  });

  return NextResponse.json({ ok: true });
}
