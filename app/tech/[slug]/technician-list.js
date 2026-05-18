"use client";

import { useMemo, useState } from "react";
import { formatHawaiiDate } from "../../../lib/date-format";

export default function TechnicianList({ property, submissions, token }) {
  const [items, setItems] = useState(submissions);
  const [savingId, setSavingId] = useState("");

  const completedCount = useMemo(
    () => items.filter((item) => item.technician_completed).length,
    [items]
  );

  async function updateSubmission(id, updates) {
    setSavingId(id);
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    const currentItem = items.find((item) => item.id === id);
    const nextItem = { ...currentItem, ...updates };

    const response = await fetch(`/api/technician/submissions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        completed: nextItem.technician_completed,
        notes: nextItem.technician_notes || ""
      })
    });

    if (!response.ok) {
      setItems((current) =>
        current.map((item) => (item.id === id ? currentItem : item))
      );
      alert("Unable to save this update. Please try again.");
    }

    setSavingId("");
  }

  return (
    <main className="tech-page">
      <header className="tech-header">
        <p className="card-label">Technician route sheet</p>
        <h1>{property.name}</h1>
        <p>{property.address}</p>
      </header>

      <section className="tech-summary">
        <div>
          <span>Service date</span>
          <strong>{formatHawaiiDate(property.next_service_date)}</strong>
        </div>
        <div>
          <span>Units</span>
          <strong>{completedCount}/{items.length} complete</strong>
        </div>
        <div>
          <span>Payment</span>
          <strong>${Number(property.resident_fee || 40).toFixed(2)} to {property.payable_to}</strong>
        </div>
      </section>

      <section className="tech-list">
        {items.length > 0 ? (
          items.map((submission) => (
            <article
              className={`tech-unit ${submission.technician_completed ? "is-complete" : ""}`}
              key={submission.id}
            >
              <label className="tech-check">
                <input
                  type="checkbox"
                  checked={submission.technician_completed}
                  disabled={savingId === submission.id}
                  onChange={(event) =>
                    updateSubmission(submission.id, {
                      technician_completed: event.target.checked
                    })
                  }
                />
                <span>
                  Unit {submission.unit_number}
                  <small>{submission.resident_name}</small>
                </span>
              </label>
              <a className="tech-phone" href={`tel:${submission.phone_number}`}>
                {submission.phone_number}
              </a>
              <textarea
                aria-label={`Notes for unit ${submission.unit_number}`}
                placeholder="Technician notes"
                value={submission.technician_notes || ""}
                disabled={savingId === submission.id}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((item) =>
                      item.id === submission.id
                        ? { ...item, technician_notes: event.target.value }
                        : item
                    )
                  )
                }
                onBlur={(event) =>
                  updateSubmission(submission.id, {
                    technician_notes: event.target.value
                  })
                }
              />
            </article>
          ))
        ) : (
          <article className="tech-unit">
            <p>No resident signups yet.</p>
          </article>
        )}
      </section>
    </main>
  );
}
