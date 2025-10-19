/**
 * n8n Formatter Utility for Webflow CMS
 *
 * Use this in your n8n Function node to transform API output
 * into Webflow CMS-ready format with HTML bullets and stringified JSON fields.
 */

export interface JDApiOutput {
  role: string;
  slug: string;
  url: string;
  seoTitle: string;
  metaDescription: string;
  keywords: {
    primary: string;
    secondary: string[];
    longTails: string[];
  };
  summary: string;
  responsibilities: string[];
  requirementsMust: string[];
  requirementsNice: string[];
  benefits: string[];
  salaryInsights?: {
    currency?: string;
    p25?: number;
    median?: number;
    p75?: number;
    period?: "year" | "month";
  };
  talentSignals?: {
    candidateCount?: number;
    topCompanies?: string[];
    openToWorkPct?: number;
    medianTenureYrs?: number;
  };
  skillTrends: string[];
  titleVariants: string[];
  jdTemplate: {
    title: string;
    intro: string;
    sections: Array<{
      heading: string;
      bullets: string[];
    }>;
  };
  applicationCTA: string;
  dataLayer: {
    pageType: "role-jd";
    role: string;
    primaryKeyword: string;
    cluster: string[];
    publishedAtISO: string;
  };
  jobPostingSchema: Record<string, any>;
}

/**
 * Converts array of strings to HTML bullet list
 */
function arrayToHtml(items: string[]): string {
  if (!items || items.length === 0) return "";
  const listItems = items.map((item) => `  <li>${item}</li>`).join("\n");
  return `<ul>\n${listItems}\n</ul>`;
}

/**
 * Formats JD template into HTML sections
 */
function formatJdTemplate(template: JDApiOutput["jdTemplate"]): string {
  let html = `<h2>${template.title}</h2>\n<p>${template.intro}</p>\n\n`;

  for (const section of template.sections) {
    html += `<h3>${section.heading}</h3>\n`;
    html += arrayToHtml(section.bullets);
    html += "\n\n";
  }

  return html.trim();
}

/**
 * Main transformer function for n8n
 * Paste this into your n8n Function node
 */
export function transformForWebflow(apiResponse: JDApiOutput) {
  const now = new Date().toISOString();

  // Ensure dataLayer has publishedAtISO
  if (!apiResponse.dataLayer.publishedAtISO) {
    apiResponse.dataLayer.publishedAtISO = now;
  }

  return {
    // Core fields
    name: `Job Description — ${apiResponse.role}`,
    slug: apiResponse.slug,
    role: apiResponse.role,

    // SEO
    "seo-title": apiResponse.seoTitle,
    "meta-description": apiResponse.metaDescription,
    "canonical-url": apiResponse.url,

    // Keywords (as CSV or JSON string, depending on your CMS setup)
    "primary-keyword": apiResponse.keywords.primary,
    "secondary-keywords": apiResponse.keywords.secondary.join(", "),
    "long-tail-keywords": apiResponse.keywords.longTails.join(", "),

    // Content (Rich Text with HTML bullets)
    summary: apiResponse.summary,
    responsibilities: arrayToHtml(apiResponse.responsibilities),
    "requirements-must": arrayToHtml(apiResponse.requirementsMust),
    "requirements-nice": arrayToHtml(apiResponse.requirementsNice),
    benefits: arrayToHtml(apiResponse.benefits),

    // Insights (JSON strings for flexibility)
    "salary-insights": apiResponse.salaryInsights
      ? JSON.stringify(apiResponse.salaryInsights)
      : "",
    "talent-signals": apiResponse.talentSignals
      ? JSON.stringify(apiResponse.talentSignals)
      : "",

    // Arrays as CSV
    "skill-trends": apiResponse.skillTrends.join(", "),
    "title-variants": apiResponse.titleVariants.join(", "),

    // JD Template (HTML)
    "jd-template": formatJdTemplate(apiResponse.jdTemplate),

    // CTA
    "application-cta": apiResponse.applicationCTA,

    // Data Layer (JSON string)
    "data-layer": JSON.stringify(apiResponse.dataLayer),

    // Schema.org (JSON string for <script> injection)
    "job-posting-schema": JSON.stringify(apiResponse.jobPostingSchema, null, 2),

    // Timestamps
    "published-at": apiResponse.dataLayer.publishedAtISO,

    // Webflow publish settings
    _archived: false,
    _draft: false,
  };
}

/**
 * Example n8n Function Node Code:
 *
 * // Get the API response from previous node
 * const apiOutput = $input.first().json.data;
 *
 * // Transform for Webflow
 * const webflowItem = transformForWebflow(apiOutput);
 *
 * // Return for next node (Webflow CMS Create/Update)
 * return { json: webflowItem };
 */

/**
 * Standalone formatter for testing
 */
export function formatForTesting(apiResponse: JDApiOutput): string {
  const webflowData = transformForWebflow(apiResponse);
  return JSON.stringify(webflowData, null, 2);
}
