import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { supabaseAdminFetch } from "../../../../lib/supabase-admin";

function csvValue(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const propertySlug = searchParams.get("property");
  const exportType = searchParams.get("type") || "full";
  const serviceDate = searchParams.get("serviceDate");
  const propertyFilter = propertySlug ? `&properties.slug=eq.${encodeURIComponent(propertySlug)}` : "";
  const serviceDateFilter = serviceDate
    ? serviceDate === "Unscheduled"
      ? "&service_date=is.null"
      : `&service_date=eq.${encodeURIComponent(serviceDate)}`
    : "";
  const submissions = await supabaseAdminFetch(
    `submissions?select=service_date,created_at,resident_name,unit_number,phone_number,payment_acknowledged,technician_completed,technician_notes,properties!inner(name,slug,address,next_service_date,next_service_note,resident_fee,payable_to)&order=created_at.desc${propertyFilter}${serviceDateFilter}`
  );

  let rows;
  let filename = `${propertySlug || "all"}-resident-submissions.csv`;

  if (exportType === "technician") {
    const sortedSubmissions = [...submissions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    rows = [
      [
        "Property",
        "Property Address",
        "Service Date",
        "Unit",
        "Resident Name",
        "Phone",
        "Payment Due",
        "Payable To",
        "Completed",
        "Technician Notes"
      ],
      ...sortedSubmissions.map((submission) => [
        submission.properties?.name,
        submission.properties?.address,
        submission.service_date || submission.properties?.next_service_date,
        submission.unit_number,
        submission.resident_name,
        submission.phone_number,
        `$${Number(submission.properties?.resident_fee || 40).toFixed(2)} cash/check`,
        submission.properties?.payable_to || "ORKIN LLC",
        submission.technician_completed ? "Yes" : "No",
        submission.technician_notes || ""
      ])
    ];
    filename = `${propertySlug || "all"}-technician-route-sheet.csv`;
  } else {
    rows = [
      [
        "timestamp",
        "property_name",
        "property_slug",
        "next_service_date",
        "submission_service_date",
        "admin_note",
        "resident_name",
        "unit_number",
        "phone_number",
        "payment_acknowledged",
        "technician_completed",
        "technician_notes"
      ],
      ...submissions.map((submission) => [
        submission.created_at,
        submission.properties?.name,
        submission.properties?.slug,
        submission.properties?.next_service_date,
        submission.service_date,
        submission.properties?.next_service_note,
        submission.resident_name,
        submission.unit_number,
        submission.phone_number,
        submission.payment_acknowledged,
        submission.technician_completed,
        submission.technician_notes
      ])
    ];
  }

  const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
