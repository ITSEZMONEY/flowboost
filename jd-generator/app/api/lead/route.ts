import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Lead capture endpoint for JD widget
 * Captures email + role data for funnel tracking
 *
 * TODO: Integrate with your CRM:
 * - HubSpot: POST to https://api.hubapi.com/contacts/v1/contact
 * - PostHog: Use posthog.capture() server-side
 * - Zapier: POST to your Zapier webhook URL
 * - Supabase: Insert into leads table
 */
export async function POST(req: Request) {
  try {
    const { email, role, source } = await req.json();

    // Basic validation
    if (!email || !role) {
      return NextResponse.json(
        { ok: false, error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Log to console for now (you'll see this in Vercel logs)
    console.log("[LEAD CAPTURED]", {
      email,
      role,
      source,
      timestamp: new Date().toISOString(),
    });

    // TODO: Add your integration here
    // Example HubSpot integration:
    // const hubspotKey = process.env.HUBSPOT_API_KEY;
    // await fetch("https://api.hubapi.com/contacts/v1/contact", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${hubspotKey}`
    //   },
    //   body: JSON.stringify({
    //     properties: [
    //       { property: "email", value: email },
    //       { property: "role_interest", value: role },
    //       { property: "lead_source", value: source }
    //     ]
    //   })
    // });

    // Example Zapier webhook:
    // const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
    // await fetch(zapierUrl, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email, role, source })
    // });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[LEAD CAPTURE ERROR]", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
