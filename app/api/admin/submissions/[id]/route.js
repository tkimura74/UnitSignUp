import { NextResponse } from "next/server";
import { getAdminRole } from "../../../../../lib/admin-auth";
import { supabaseAdminFetch } from "../../../../../lib/supabase-admin";

export async function POST(request, { params }) {
  const role = await getAdminRole();

  if (role !== "super") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const submissionId = resolvedParams.id;

  await supabaseAdminFetch(`submissions?id=eq.${encodeURIComponent(submissionId)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" }
  });

  return NextResponse.redirect(new URL("/admin?removed=1", request.url));
}
