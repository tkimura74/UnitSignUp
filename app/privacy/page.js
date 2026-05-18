export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <section className="privacy-panel">
        <p className="card-label">Privacy notice</p>
        <h1>Resident service signup privacy notice</h1>
        <p className="privacy-updated">Last updated: May 2026</p>

        <div className="privacy-section">
          <h2>Information we collect</h2>
          <p>
            When a resident submits a service request, this site collects the resident name, unit
            number, phone number, selected property, service date, payment acknowledgment, and
            submission time. Technician notes may be added after service.
          </p>
        </div>

        <div className="privacy-section">
          <h2>How the information is used</h2>
          <p>
            Resident information is used to coordinate requested interior pest control service,
            prepare route sheets, contact residents if access coordination is needed, and maintain
            service records for the property.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Who may see the information</h2>
          <p>
            Information may be viewed by authorized Orkin or Rollins branch staff, service managers,
            assigned technicians, and property management staff when needed to coordinate or complete
            the requested service. We do not sell resident signup information.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Retention</h2>
          <p>
            Signup and service records are intended to be retained for up to one year by property,
            then automatically removed from the active database.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Security and service providers</h2>
          <p>
            The site uses hosted service providers for website hosting, database storage, and bot
            protection. These providers may process technical information such as IP address, device
            information, browser information, and security verification data to operate and protect
            the service.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Children</h2>
          <p>
            This signup page is intended for adult residents or authorized occupants. It is not
            intended for children under 13.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Questions or changes</h2>
          <p>
            To ask about a submission, request a correction, or ask that a record be removed when
            no longer needed for service coordination, contact Branch 801.
          </p>
          <p>
            <a href="mailto:Branch801@rollins.com?subject=Resident%20Signup%20Privacy%20Question">
              Branch801@rollins.com
            </a>
          </p>
        </div>

        <div className="privacy-disclaimer">
          <p>
            This notice is intended to explain how this resident signup site is used for service
            coordination. It is not a substitute for legal review or any official company privacy
            policy that may apply.
          </p>
        </div>
      </section>
    </main>
  );
}
