import SignupForm from "./signup-form";

async function fetchProperty(slug) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: "Supabase environment variables are not configured yet.",
      details: `URL visible: ${supabaseUrl ? "yes" : "no"}. Key visible: ${supabaseAnonKey ? "yes" : "no"}.`
    };
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/properties?slug=eq.${encodeURIComponent(slug)}&is_active=eq.true&select=*`,
    {
      headers: {
        apikey: supabaseAnonKey,
        ...(supabaseAnonKey.startsWith("eyJ") ? { Authorization: `Bearer ${supabaseAnonKey}` } : {})
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const responseText = await response.text();
    return {
      error: "Unable to load this property right now.",
      details: `Supabase responded with ${response.status}: ${responseText || "No response body."}`
    };
  }

  const properties = await response.json();
  return {
    property: properties[0],
    details: properties.length === 0 ? `No active property found for slug "${slug}".` : ""
  };
}

export default async function PropertySignupPage({ params }) {
  const resolvedParams = await params;
  const { property, error, details } = await fetchProperty(resolvedParams.slug);

  if (error || !property) {
    return (
      <main className="simple-page">
        <section className="simple-panel">
          <p className="card-label">Signup unavailable</p>
          <h1>{error || "This property is not active yet."}</h1>
          <p>{details || "Check the property slug and Supabase setup, then try again."}</p>
        </section>
      </main>
    );
  }

  return <SignupForm property={property} />;
}
