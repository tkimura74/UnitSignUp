import { NextResponse } from "next/server";
import { supabaseAdminFetch } from "../../../../../lib/supabase-admin";

export async function POST(request, { params }) {
  const resolvedParams = await params;
  const submissionId = resolvedParams.id;
  const payload = await request.json().catch(() => null);

  if (!payload) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = String(payload.token || "");

  if (!token) {
    return NextResponse.json({ error: "Missing technician token." }, { status: 401 });
  }

  const submissions = await supabaseAdminFetch(
    `submissions?select=id,properties!inner(technician_token)&id=eq.${encodeURIComponent(submissionId)}&limit=1`
  );
  const submission = submissions[0];

  if (!submission || submission.properties?.technician_token !== token) {
    return NextResponse.json({ error: "Invalid technician token." }, { status: 401 });
  }

  await supabaseAdminFetch(`submissions?id=eq.${encodeURIComponent(submissionId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      technician_completed: Boolean(payload.completed),
      technician_notes: String(payload.notes || "").trim().slice(0, 500)
    })
  });

  return NextResponse.json({ ok: true });
}
