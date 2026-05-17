"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

export default function SignupForm({ property }) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    residentName: "",
    unitNumber: "",
    phoneNumber: "",
    paymentAcknowledged: false,
    companyName: "",
    turnstileToken: ""
  });
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    window.onTurnstileVerified = (token) => {
      setFormData((current) => ({ ...current, turnstileToken: token }));
    };

    return () => {
      delete window.onTurnstileVerified;
    };
  }, []);

  const fee = useMemo(() => {
    const amount = Number(property.resident_fee ?? 40);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2
    }).format(amount);
  }, [property.resident_fee]);

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function submitSignup(event) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        propertyId: property.id,
        residentName: formData.residentName,
        unitNumber: formData.unitNumber,
        phoneNumber: formData.phoneNumber,
        paymentAcknowledged: formData.paymentAcknowledged,
        companyName: formData.companyName,
        turnstileToken: formData.turnstileToken
      })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setStatus("error");
      setMessage(result?.error || "The request could not be saved. Please try again.");
      return;
    }

    setStatus("success");
    setMessage(
      `${formData.residentName.trim()} in unit ${formData.unitNumber.trim()} has been added for ${property.name}. Please have ${fee} cash or check payable to ${property.payable_to} ready at the time of service.`
    );
  }

  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="page-title">
        <div className="hero__overlay"></div>
        <div className="hero__content">
          <p className="eyebrow">Next exterior service visit</p>
          <h1 id="page-title">Add your unit for same-day interior treatment.</h1>
          <p className="hero__copy">
            While your Orkin Pro is on property for exterior treatments, residents can sign up
            for interior unit treatment during that same visit.
          </p>
          <p className="property-intro">This signup is for {property.name} residents only.</p>
        </div>
      </section>

      <section className="content-grid" aria-label="Signup details">
        <aside className="visit-card">
          <p className="card-label">Upcoming visit</p>
          <h2>{property.service_schedule}</h2>
          {property.next_service_date ? (
            <p className="next-date">
              Next service date:{" "}
              <strong>
                {new Date(`${property.next_service_date}T00:00:00`).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </strong>
            </p>
          ) : null}
          {!property.next_service_date ? (
            <p className="next-date next-date--pending">Next service date: To be confirmed</p>
          ) : null}
          <dl className="visit-meta">
            <div className="visit-row">
              <span>Property</span>
              <strong>{property.name}</strong>
            </div>
            {property.address ? (
              <div className="visit-row">
                <span>Address</span>
                <strong>{property.address}</strong>
              </div>
            ) : null}
            <div className="visit-row">
              <span>Resident fee</span>
              <strong>{fee} cash or check</strong>
            </div>
            <div className="visit-row">
              <span>Payable to</span>
              <strong>{property.payable_to}</strong>
            </div>
          </dl>
          <p className="note">{property.notes}</p>
        </aside>

        <section className="signup-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <p className="card-label">Resident request</p>
            <h2 id="form-title">Interior Unit General Pest Control treatment.</h2>
          </div>

          {status === "success" ? (
            <div className="confirmation" aria-live="polite">
              <p className="card-label">Request received</p>
              <h2>You're on the list for the next visit.</h2>
              <p>{message}</p>
            </div>
          ) : (
            <form onSubmit={submitSignup}>
              {turnstileSiteKey ? (
                <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
              ) : null}
              <div className="field-group">
                <label htmlFor="residentName">Resident name</label>
                <input
                  id="residentName"
                  name="residentName"
                  type="text"
                  autoComplete="name"
                  value={formData.residentName}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="unitNumber">Unit number</label>
                  <input
                    id="unitNumber"
                    name="unitNumber"
                    type="text"
                    autoComplete="address-line2"
                    value={formData.unitNumber}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="phoneNumber">Phone number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="[0-9+() .-]{7,}"
                  title="Enter a valid phone number."
                  value={formData.phoneNumber}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>

              <label className="agreement" htmlFor="paymentAcknowledged">
                <input
                  id="paymentAcknowledged"
                  name="paymentAcknowledged"
                  type="checkbox"
                  checked={formData.paymentAcknowledged}
                  onChange={updateField}
                  required
                />
                <span>
                  I agree to pay <strong>{fee} by cash or check payable to {property.payable_to}</strong>
                  {" "}at the time of service.
                </span>
              </label>

              <div className="field-group honeypot" aria-hidden="true">
                <label htmlFor="companyName">Company name</label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.companyName}
                  onChange={updateField}
                />
              </div>

              {turnstileSiteKey ? (
                <div
                  className="cf-turnstile"
                  data-sitekey={turnstileSiteKey}
                  data-callback="onTurnstileVerified"
                />
              ) : null}

              {status === "error" ? <p className="form-alert">{message}</p> : null}

              <button className="submit-button" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Saving request..." : "Reserve my unit"}
              </button>
            </form>
          )}
        </section>
      </section>
    </main>
  );
}
