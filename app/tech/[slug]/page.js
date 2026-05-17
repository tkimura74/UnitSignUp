import { supabaseAdminFetch } from "../../../lib/supabase-admin";
import TechnicianList from "./technician-list";

function unitSortValue(unitNumber) {
  const text = String(unitNumber || "");
  const number = text.match(/\d+/)?.[0];
  return number ? Number(number) : Number.MAX_SAFE_INTEGER;
}

async function getTechnicianData(slug, token) {
  if (!token) {
    return { error: "Technician link is missing its access token." };
  }

  const properties = await supabaseAdminFetch(
    `properties?select=*&slug=eq.${encodeURIComponent(slug)}&technician_token=eq.${encodeURIComponent(token)}&limit=1`
  );
  const property = properties[0];

  if (!property) {
    return { error: "This technician link is not valid." };
  }

  const serviceDateFilter = property.next_service_date
    ? `&service_date=eq.${encodeURIComponent(property.next_service_date)}`
    : "&service_date=is.null";
  const submissions = await supabaseAdminFetch(
    `submissions?select=id,service_date,created_at,resident_name,unit_number,phone_number,payment_acknowledged,technician_completed,technician_notes&property_id=eq.${encodeURIComponent(property.id)}${serviceDateFilter}&order=unit_number.asc`
  );

  submissions.sort((a, b) => {
    const unitDifference = unitSortValue(a.unit_number) - unitSortValue(b.unit_number);
    if (unitDifference !== 0) return unitDifference;
    return String(a.unit_number || "").localeCompare(String(b.unit_number || ""));
  });

  return { property, submissions };
}

export default async function TechnicianPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token || "";
  const { property, submissions, error } = await getTechnicianData(resolvedParams.slug, token);

  if (error) {
    return (
      <main className="tech-page">
        <section className="tech-panel">
          <p className="card-label">Technician list</p>
          <h1>Unable to open this route sheet.</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return <TechnicianList property={property} submissions={submissions} token={token} />;
}
