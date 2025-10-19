import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { JDOutputSchema } from "@/lib/schema";

export const runtime = "edge";

function slugifyRole(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, locale = "en-US", estimateSalary = false } = body ?? {};

    if (!role) {
      return NextResponse.json({ error: "role is required" }, { status: 400 });
    }

    const slug = slugifyRole(role);
    const url = `https://juicebox.ai/job-description/${slug}`;

    const system = `
You are "Juicebox JD Writer", an expert recruiter + SEO/GEO copywriter.
You must produce a SINGLE FLAT JSON object matching this EXACT structure (no nested research/seo/content objects):

{
  "role": "Role Title",
  "slug": "role-slug",
  "url": "https://juicebox.ai/job-description/role-slug",
  "seoTitle": "Role Title Job Description | Juicebox",
  "metaDescription": "Detailed job description for Role Title...",
  "keywords": {
    "primary": "role title job description",
    "secondary": ["keyword1", "keyword2"],
    "longTails": ["long tail 1", "long tail 2"]
  },
  "summary": "Brief role summary paragraph",
  "responsibilities": ["Responsibility 1", "Responsibility 2", "..."],
  "requirementsMust": ["Must-have 1", "Must-have 2", "..."],
  "requirementsNice": ["Nice-to-have 1", "Nice-to-have 2"],
  "benefits": ["Benefit 1", "Benefit 2"],
  "salaryInsights": {
    "currency": "USD",
    "p25": 80000,
    "median": 100000,
    "p75": 120000,
    "period": "year"
  },
  "talentSignals": {
    "candidateCount": 5000,
    "topCompanies": ["Company1", "Company2"],
    "openToWorkPct": 15,
    "medianTenureYrs": 3
  },
  "skillTrends": ["Skill 1", "Skill 2"],
  "titleVariants": ["Variant 1", "Variant 2"],
  "jdTemplate": {
    "title": "Marketing Manager Job Description",
    "intro": "Template introduction text",
    "sections": [
      {
        "heading": "Section Name",
        "bullets": ["Bullet 1", "Bullet 2"]
      }
    ]
  },
  "applicationCTA": "Hire this role with Juicebox →",
  "dataLayer": {
    "pageType": "role-jd",
    "role": "Role Title",
    "primaryKeyword": "role title job description",
    "cluster": ["related", "keywords"],
    "publishedAtISO": "2025-10-13T00:00:00.000Z"
  },
  "jobPostingSchema": {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "Role Title",
    "employmentType": "FULL_TIME",
    "datePosted": "2025-10-13",
    "hiringOrganization": {"@type": "Organization", "name": "Juicebox"},
    "description": "Brief description",
    "url": "https://juicebox.ai/job-description/role-slug"
  }
}

Rules:
- Use FLAT structure, not nested research/seo/content objects
- seoTitle ≤ 60 chars, metaDescription ≤ 150 chars
- Responsibilities: action verbs + outcomes (minimum 5)
- RequirementsMust: capability + evidence (minimum 5)
- jdTemplate.sections must be array of objects with "heading" and "bullets" properties
- salaryInsights only if estimateSalary is true
- Respect locale spelling (en-US vs en-GB)
Return ONLY the JSON object, no markdown, no prose.
    `.trim();

    const user = `
Inputs:
role: ${role}
locale: ${locale}
estimateSalary: ${estimateSalary}

Routing/SEO:
slug: ${slug}
url: ${url}
primary_keyword: ${role} job description

Constraints:
- Use the provided slug and url verbatim.
- Keep bullets skimmable (no wall-of-text paragraphs).
- Align content to a pSEO "Role Job Description" hub (role-only).
    `.trim();

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: user }],
    });

    const raw = (msg.content?.[0] as any)?.text ?? "{}";
    console.log("Raw Claude response:", raw.substring(0, 500));

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", raw);
      return NextResponse.json(
        { ok: false, error: "Failed to parse Claude response as JSON" },
        { status: 500 }
      );
    }

    // enforce routing fields
    parsed.slug = slug;
    parsed.url = url;
    if (parsed?.jobPostingSchema) parsed.jobPostingSchema.url = url;

    console.log("Parsed keys:", Object.keys(parsed));

    const data = JDOutputSchema.parse(parsed);
    return NextResponse.json({ ok: true, data }, { status: 200 });
  } catch (e: any) {
    console.error("Generation error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
