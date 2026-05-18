"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";
import { formatHawaiiDate, formatHawaiiDateTime } from "../../../lib/date-format";

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
  const additionalServicesMailto = useMemo(() => {
    const subject = encodeURIComponent(`Additional Pest Service Consultation - ${property.name}`);
    const body = encodeURIComponent(
      `Hello,\n\nI am interested in additional pest services for ${property.name}.\n\nPlease contact me with more information.\n`
    );
    return `mailto:Branch801@rollins.com?subject=${subject}&body=${body}`;
  }, [property.name]);
  const lastUpdated = property.updated_at || property.created_at;

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
      `${formData.residentName.trim()} in unit ${formData.unitNumber.trim()} has been added for ${property.name}. You do not need to submit again unless your information changes. Please make sure your unit can be accessed during the scheduled service window and have ${fee} cash or check payable to ${property.payable_to} ready at the time of service.`
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
          <div className={`visit-highlight ${property.next_service_date ? "" : "visit-highlight--pending"}`}>
            <span>Next service date</span>
            <strong>
              {property.next_service_date ? formatHawaiiDate(property.next_service_date) : "To be confirmed"}
            </strong>
          </div>
          {lastUpdated ? (
            <p className="last-updated">Last updated: {formatHawaiiDateTime(lastUpdated)}</p>
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
          <p className="access-note">
            Please make sure your unit can be accessed during the scheduled service window.
          </p>
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

      <section className="service-info" id="about-service" aria-labelledby="service-info-title">
        <div className="service-info__inner">
          <div className="service-info__intro">
            <p className="card-label">About the service</p>
            <h2 id="service-info-title">Interior protection while your Orkin Pro is already on site.</h2>
            <p>
              This same-day add-on gives your unit an interior general pest control treatment
              during the property's scheduled exterior service visit. Your technician applies a
              liquid residual barrier in targeted interior areas to help protect the living space
              from common crawling pests, with cabinet-area bait applied when conditions call for it.
            </p>
          </div>

          <div className="service-benefits" aria-label="Service benefits">
            <article>
              <span>1</span>
              <h3>Residual barrier</h3>
              <p>
                A targeted liquid treatment is applied to key interior areas where pests commonly
                travel or enter.
              </p>
            </article>
            <article>
              <span>2</span>
              <h3>Convenient timing</h3>
              <p>
                Request service for the same visit while the technician is already treating the
                exterior of the property.
              </p>
            </article>
            <article>
              <span>3</span>
              <h3>Common pest coverage</h3>
              <p>
                Helps protect against ants, roaches, spiders, centipedes, and other common
                household pests.
              </p>
            </article>
          </div>

          <div className="pest-strip" aria-label="Common pests covered">
            <span>Ants</span>
            <span>Roaches</span>
            <span>Spiders</span>
            <span>Centipedes</span>
          </div>

          <div className="additional-services">
            <div>
              <p className="card-label">Additional services</p>
              <h2>Need help with a larger pest concern?</h2>
              <p>
                For issues that may need a dedicated inspection or specialty treatment, ask about
                bed bug service and intensive roach cleanout service.
              </p>
            </div>
            <a
              className="secondary-button compact-button"
              href={additionalServicesMailto}
            >
              Ask about services
            </a>
          </div>

          <div className="termite-callout">
            <div>
              <p className="card-label">Free termite inspection</p>
              <h2>Protect more than your unit. Protect your home investment.</h2>
              <p>
                Termite activity is easier to address when it is found early. If you have noticed
                soft wood, mud tubes, discarded wings, bubbling paint, or unexplained damage, ask
                about scheduling a free residential termite inspection.
              </p>
            </div>
            <a className="submit-button compact-button" href="tel:8083540869">
              Call (808) 354-0869
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>
          Resident information submitted through this page is used to coordinate requested service
          for {property.name}. Your information may be shared with the property team or technician
          as needed to complete the visit. Service availability, pricing, and treatment
          recommendations may vary by property, unit condition, and technician assessment.
        </p>
      </footer>
    </main>
  );
}
