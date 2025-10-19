import { z } from "zod";

/**
 * Strict JSON contract for a role page under /job-description/[role]
 * Mirrors the doc's sections: Research, Keywords, Scaffolding, Data Layer, Content, Design.
 */
export const JDOutputSchema = z.object({
  // scaffolding
  role: z.string(),
  slug: z.string(), // kebab-case role only (no suffixes)
  url: z.string().url(), // https://juicebox.ai/job-description/[slug]

  // seo
  seoTitle: z.string(), // <= 60 chars
  metaDescription: z.string(), // <= 150 chars

  // keywords (cluster + long-tails from Research/Keywords)
  keywords: z.object({
    primary: z.string(),
    secondary: z.array(z.string()).default([]),
    longTails: z.array(z.string()).default([]),
  }),

  // content blocks (clean bullets; recruiter-centric)
  summary: z.string(),
  responsibilities: z.array(z.string()).min(5),
  requirementsMust: z.array(z.string()).min(5),
  requirementsNice: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),

  // live insights placeholders (to be filled by data jobs later)
  salaryInsights: z
    .object({
      currency: z.string().optional(),
      p25: z.number().optional(),
      median: z.number().optional(),
      p75: z.number().optional(),
      period: z.enum(["year", "month"]).optional(),
    })
    .optional(),

  talentSignals: z
    .object({
      candidateCount: z.number().optional(),
      topCompanies: z.array(z.string()).optional(),
      openToWorkPct: z.number().optional(),
      medianTenureYrs: z.number().optional(),
    })
    .optional(),

  skillTrends: z.array(z.string()).default([]),
  titleVariants: z.array(z.string()).default([]),

  // templates + CTA
  jdTemplate: z.object({
    title: z.string(),
    intro: z.string(),
    sections: z.array(
      z.object({
        heading: z.string(),
        bullets: z.array(z.string()),
      })
    ),
  }),
  applicationCTA: z.string(), // e.g., "Hire this role with Juicebox →"

  // data layer (explicit analytics surface)
  dataLayer: z.object({
    pageType: z.literal("role-jd"),
    role: z.string(),
    primaryKeyword: z.string(),
    cluster: z.array(z.string()).default([]),
    publishedAtISO: z.string(), // set by pipeline (e.g., new Date().toISOString())
  }),

  // schema.org
  jobPostingSchema: z.record(z.any()),
});

export type JDOutput = z.infer<typeof JDOutputSchema>;
