export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="simple-page">
      <section className="simple-panel">
        <p className="card-label">Admin login</p>
        <h1>Sign in to manage properties.</h1>
        <form className="admin-form" action="/api/admin/login" method="post">
          <label>
            Admin password
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {error === "invalid" ? <p className="form-alert">That password was not correct.</p> : null}
          {error === "missing-config" ? <p className="form-alert">ADMIN_PASSWORD is missing from .env.local.</p> : null}
          <button className="submit-button" type="submit">Log in</button>
        </form>
      </section>
    </main>
  );
}
