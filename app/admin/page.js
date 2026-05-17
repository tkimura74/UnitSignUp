import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAdminAuthenticated } from "../../lib/admin-auth";
import { hasAdminSupabaseConfig, supabaseAdminFetch } from "../../lib/supabase-admin";

async function getAdminData() {
  if (!hasAdminSupabaseConfig()) {
    return {
      setupError: "Add SUPABASE_SERVICE_ROLE_KEY and ADMIN_PASSWORD to .env.local, then restart the dev server.",
      properties: [],
      submissions: []
    };
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  await Promise.all([
    supabaseAdminFetch(`submissions?service_date=lt.${cutoffDate}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    }),
    supabaseAdminFetch(`submissions?service_date=is.null&created_at=lt.${cutoffDate}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" }
    })
  ]);

  const [properties, submissions] = await Promise.all([
    supabaseAdminFetch("properties?select=*&order=name.asc"),
    supabaseAdminFetch(
      "submissions?select=id,property_id,service_date,created_at,resident_name,unit_number,phone_number,payment_acknowledged,technician_completed,technician_notes,properties(name,slug)&order=service_date.desc.nullslast,created_at.desc&limit=1000"
    )
  ]);

  return { properties, submissions };
}

function formatDate(dateValue) {
  if (!dateValue) return "Not set";
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const { properties, submissions, setupError } = await getAdminData();
  const submissionsByProperty = new Map();
  submissions.forEach((submission) => {
    const current = submissionsByProperty.get(submission.property_id) || [];
    current.push(submission);
    submissionsByProperty.set(submission.property_id, current);
  });
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="card-label">Admin dashboard</p>
          <h1>Resident treatment signups</h1>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="secondary-button" type="submit">Log out</button>
        </form>
      </header>

      {setupError ? (
        <section className="admin-panel">
          <h2>Finish admin setup</h2>
          <p>{setupError}</p>
        </section>
      ) : null}

      <section className="admin-grid">
        <div className="admin-stack">
          <div className="admin-panel">
            <div className="panel-heading-row">
              <h2>Submissions by property</h2>
              <a className="secondary-button" href="/api/admin/export">Export all manager CSV</a>
            </div>
          </div>

          {properties.length > 0 ? (
            properties.map((property) => {
              const propertySubmissions = submissionsByProperty.get(property.id) || [];
              const currentServiceKey = property.next_service_date || "unscheduled";
              const currentSubmissions = propertySubmissions.filter(
                (submission) => (submission.service_date || "unscheduled") === currentServiceKey
              );
              const historyGroups = new Map();
              propertySubmissions
                .filter((submission) => (submission.service_date || "unscheduled") !== currentServiceKey)
                .filter((submission) => new Date(submission.service_date || submission.created_at) >= oneYearAgo)
                .forEach((submission) => {
                  const key = submission.service_date || "Unscheduled";
                  const current = historyGroups.get(key) || [];
                  current.push(submission);
                  historyGroups.set(key, current);
                });
              const technicianUrl = `${baseUrl}/tech/${property.slug}?token=${property.technician_token}`;
              const technicianEmailSubject = encodeURIComponent(`${property.name} route sheet`);
              const technicianEmailBody = encodeURIComponent(
                `Here is the route sheet for ${property.name}.\n\nService date: ${formatDate(property.next_service_date)}\n\nOpen route sheet:\n${technicianUrl}`
              );

              return (
                <section className="admin-panel property-submission-panel" key={property.id}>
                  <div className="panel-heading-row">
                    <div>
                      <p className="card-label">{property.is_active ? "Active property" : "Inactive property"}</p>
                      <h2>{property.name}</h2>
                      <p className="submission-count">
                        {currentSubmissions.length} current signup{currentSubmissions.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="export-actions">
                      <a className="secondary-button" href={`/api/admin/export?property=${property.slug}`}>
                        Manager CSV
                      </a>
                      <a
                        className="submit-button compact-button"
                        href={`mailto:?subject=${technicianEmailSubject}&body=${technicianEmailBody}`}
                      >
                        Send Technician Link
                      </a>
                    </div>
                  </div>

                  <div className="service-summary">
                    <div>
                      <span>Next service date</span>
                      <strong>{formatDate(property.next_service_date)}</strong>
                    </div>
                    <div>
                      <span>Schedule</span>
                      <strong>{property.service_schedule}</strong>
                    </div>
                    <div>
                      <span>Signup link</span>
                      <a href={`/p/${property.slug}`}>/p/{property.slug}</a>
                    </div>
                    <div>
                      <span>Technician view</span>
                      {property.technician_token ? (
                        <a href={technicianUrl}>Open route sheet</a>
                      ) : (
                        <strong>Run token migration</strong>
                      )}
                    </div>
                  </div>

                  {property.next_service_note ? (
                    <p className="service-note">
                      <strong>Admin note:</strong> {property.next_service_note}
                    </p>
                  ) : null}

                  <details className="property-editor">
                    <summary>Edit property settings</summary>
                    <form className="admin-form" action={`/api/admin/properties/${property.id}`} method="post">
                      <input type="hidden" name="_action" value="update" />
                      <label>
                        Property name
                        <input name="name" type="text" defaultValue={property.name} required />
                      </label>
                      <label>
                        Link slug
                        <input name="slug" type="text" defaultValue={property.slug} required />
                      </label>
                      <label>
                        Address
                        <input name="address" type="text" defaultValue={property.address || ""} />
                      </label>
                      <label>
                        Service schedule
                        <input name="service_schedule" type="text" defaultValue={property.service_schedule} required />
                      </label>
                      <label>
                        Next service date
                        <input name="next_service_date" type="date" defaultValue={property.next_service_date || ""} />
                      </label>
                      <label>
                        Admin note
                        <textarea name="next_service_note" rows="3" defaultValue={property.next_service_note || ""} />
                      </label>
                      <label>
                        Resident fee
                        <input name="resident_fee" type="number" min="0" step="0.01" defaultValue={property.resident_fee} required />
                      </label>
                      <label>
                        Resident notes
                        <textarea name="notes" rows="4" defaultValue={property.notes || ""} />
                      </label>
                      <label className="admin-check">
                        <input name="is_active" type="checkbox" defaultChecked={property.is_active} />
                        Active signup page
                      </label>
                      <button className="submit-button" type="submit">Save property</button>
                    </form>
                    <form action={`/api/admin/properties/${property.id}`} method="post">
                      <input type="hidden" name="_action" value="delete" />
                      <button className="danger-button" type="submit">
                        Delete property and its submissions
                      </button>
                    </form>
                  </details>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Resident</th>
                          <th>Unit</th>
                          <th>Phone</th>
                          <th>Done</th>
                          <th>Paid ack.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentSubmissions.length > 0 ? (
                          currentSubmissions.map((submission) => (
                            <tr key={submission.id}>
                              <td>{new Date(submission.created_at).toLocaleString()}</td>
                              <td>{submission.resident_name}</td>
                              <td>{submission.unit_number}</td>
                              <td>{submission.phone_number}</td>
                              <td>{submission.technician_completed ? "Yes" : "No"}</td>
                              <td>{submission.payment_acknowledged ? "Yes" : "No"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6">No current-service submissions for this property yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <details className="service-history">
                    <summary>Past service history ({propertySubmissions.length - currentSubmissions.length})</summary>
                    {[...historyGroups.entries()].map(([serviceDate, serviceSubmissions]) => (
                      <div className="history-group" key={serviceDate}>
                        <div className="panel-heading-row">
                          <h3>{serviceDate === "Unscheduled" ? "Unscheduled" : formatDate(serviceDate)}</h3>
                          <a
                            className="secondary-button"
                            href={`/api/admin/export?property=${property.slug}&serviceDate=${encodeURIComponent(serviceDate)}`}
                          >
                            Export
                          </a>
                        </div>
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Resident</th>
                                <th>Unit</th>
                                <th>Phone</th>
                                <th>Done</th>
                                <th>Tech notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {serviceSubmissions.map((submission) => (
                                <tr key={submission.id}>
                                  <td>{new Date(submission.created_at).toLocaleString()}</td>
                                  <td>{submission.resident_name}</td>
                                  <td>{submission.unit_number}</td>
                                  <td>{submission.phone_number}</td>
                                  <td>{submission.technician_completed ? "Yes" : "No"}</td>
                                  <td>{submission.technician_notes || ""}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </details>
                </section>
              );
            })
          ) : (
            <section className="admin-panel">
              <p>No properties yet.</p>
            </section>
          )}
        </div>

        <aside className="admin-stack">
          <section className="admin-panel">
            <h2>Add property</h2>
            <form className="admin-form" action="/api/admin/properties" method="post">
              <label>
                Property name
                <input name="name" type="text" required />
              </label>
              <label>
                Link slug
                <input name="slug" type="text" placeholder="oak-grove" />
              </label>
              <label>
                Address
                <input name="address" type="text" />
              </label>
              <label>
                Service schedule
                <input name="service_schedule" type="text" defaultValue="Each 3rd Thursday of the Month" required />
              </label>
              <label>
                Next service date
                <input name="next_service_date" type="date" />
              </label>
              <label>
                Admin note
                <textarea name="next_service_note" rows="3" placeholder="Example: Confirmed with manager for the upcoming Thursday visit." />
              </label>
              <label>
                Resident fee
                <input name="resident_fee" type="number" min="0" step="0.01" defaultValue="40" required />
              </label>
              <label>
                Resident notes
                <textarea name="notes" rows="4" defaultValue="Please be available by phone in case the technician or property team needs to coordinate access." />
              </label>
              <label className="admin-check">
                <input name="is_active" type="checkbox" defaultChecked />
                Active signup page
              </label>
              <button className="submit-button" type="submit">Create property</button>
            </form>
          </section>
        </aside>
      </section>
    </main>
  );
}
