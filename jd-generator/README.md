# Juicebox JD Generator

**Role-focused job description generator for pSEO hub**

Generates CMS-ready JSON aligned to the pSEO Hub doc sections (Research → Keywords → Scaffolding → Data Layer → Content → Design) for role-only pages at `/job-description/[role]`.

## Features

- **Claude-powered generation**: Uses Anthropic's Claude to generate high-quality, recruiter-centric JDs
- **Strict schema validation**: Zod-based validation ensures consistent output
- **Role-only URL scheme**: `/job-description/marketing-manager` (no city logic)
- **SEO-optimized**: Title ≤60 chars, meta ≤150 chars, JobPosting JSON-LD
- **CMS-ready output**: Direct mapping to Webflow CMS fields
- **n8n integration**: Server-rendered publishing pipeline
- **Juicebox brand tone**: Crisp, confident, operator-first

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Development

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

## API Usage

### Endpoint: `POST /api/generate`

**Request Body:**

```json
{
  "role": "Marketing Manager",
  "locale": "en-US",
  "estimateSalary": true
}
```

**Response:**

```json
{
  "ok": true,
  "data": {
    "role": "Marketing Manager",
    "slug": "marketing-manager",
    "url": "https://juicebox.ai/job-description/marketing-manager",
    "seoTitle": "Marketing Manager Job Description | Juicebox",
    "metaDescription": "Hire a Marketing Manager: responsibilities, requirements, skills. Get data-driven insights and a ready-to-use JD template.",
    "keywords": {
      "primary": "marketing manager job description",
      "secondary": ["marketing manager responsibilities", "marketing manager skills"],
      "longTails": ["what does a marketing manager do", "marketing manager qualifications"]
    },
    "summary": "...",
    "responsibilities": ["..."],
    "requirementsMust": ["..."],
    "requirementsNice": ["..."],
    "benefits": ["..."],
    "salaryInsights": {
      "currency": "USD",
      "p25": 70000,
      "median": 90000,
      "p75": 120000,
      "period": "year"
    },
    "talentSignals": {
      "candidateCount": 15000,
      "topCompanies": ["Google", "Meta", "HubSpot"],
      "openToWorkPct": 12,
      "medianTenureYrs": 3.2
    },
    "skillTrends": ["..."],
    "titleVariants": ["..."],
    "jdTemplate": {
      "title": "Marketing Manager",
      "intro": "...",
      "sections": [...]
    },
    "applicationCTA": "Hire this role with Juicebox →",
    "dataLayer": {
      "pageType": "role-jd",
      "role": "Marketing Manager",
      "primaryKeyword": "marketing manager job description",
      "cluster": ["..."],
      "publishedAtISO": "2025-01-15T10:30:00.000Z"
    },
    "jobPostingSchema": {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "Marketing Manager",
      "datePosted": "2025-01-15",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Juicebox"
      },
      "description": "...",
      "url": "https://juicebox.ai/job-description/marketing-manager"
    }
  }
}
```

## Webflow CMS Setup

### Collection: "Role Job Descriptions"

Create a new collection with these fields:

| Field Name | Type | Notes |
|------------|------|-------|
| Name | Plain Text | Auto: "Job Description — [Role]" |
| Slug | Plain Text | Auto-generated or override with API slug |
| Role | Plain Text | From API: `role` |
| SEO Title | Plain Text | From API: `seoTitle` (≤60 chars) |
| Meta Description | Plain Text | From API: `metaDescription` (≤150 chars) |
| Summary | Rich Text | From API: `summary` |
| Responsibilities | Rich Text | Convert array → `<ul><li>...</li></ul>` |
| Requirements (Must) | Rich Text | Convert array → HTML bullets |
| Requirements (Nice) | Rich Text | Convert array → HTML bullets |
| Benefits | Rich Text | Convert array → HTML bullets |
| Salary Insights | Plain Text | Stringify JSON or pre-render |
| Talent Signals | Plain Text | Stringify JSON |
| Skill Trends | Plain Text | CSV or JSON |
| Title Variants | Plain Text | CSV or JSON |
| JD Template | Rich Text | Format as HTML sections |
| Application CTA | Plain Text | From API: `applicationCTA` |
| Data Layer | Plain Text | Stringify JSON |
| JobPosting JSON-LD | Plain Text | Stringify JSON for `<script>` tag |
| Canonical URL | Plain Text | From API: `url` |

### Template Bindings

In your Webflow template page (`/job-description/[slug]`):

**Head (Before `</head>`):**

```html
<link rel="canonical" href="{Canonical URL}">
<script type="application/ld+json">{JobPosting JSON-LD}</script>
```

**Body:**

- H1 → Bind to `{Role}`
- Summary → Bind Rich Text field
- Responsibilities → Bind Rich Text field (renders as bullets)
- Requirements → Bind respective Rich Text fields
- Benefits → Bind Rich Text field

**Optional: Copy JD Template Button**

Add a button that copies the JD Template to clipboard for recruiters.

## n8n Automation

### Pipeline Overview

1. **Trigger**: Airtable/Google Sheets row (columns: `role`, `locale`, `estimateSalary`)
2. **HTTP Request**: `POST` to your Vercel app `/api/generate`
3. **Function Node**: Transform API output using `lib/n8n-formatter.ts`
4. **Webflow CMS**: Create/Update item with `_draft: false`

### Function Node Code

```javascript
// Import the formatter (paste transformForWebflow function from lib/n8n-formatter.ts)

// Get API response
const apiOutput = $input.first().json.data;

// Transform for Webflow
const webflowItem = transformForWebflow(apiOutput);

// Return for Webflow node
return { json: webflowItem };
```

See `lib/n8n-formatter.ts` for the complete transformer function.

## Project Structure

```
jd-generator/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts        # Claude API endpoint
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/
│   └── JobForm.tsx             # Test UI component
├── lib/
│   ├── anthropic.ts            # Anthropic SDK client
│   ├── schema.ts               # Zod schema + types
│   └── n8n-formatter.ts        # Webflow CMS formatter
├── styles/
│   └── globals.css             # Tailwind + Juicebox theme
├── .env.local.example          # Environment template
├── next.config.mjs             # Next.js config
├── package.json                # Dependencies
├── tailwind.config.ts          # Juicebox design tokens
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
```

## QA Checklist

Before pushing to production, verify:

- [ ] URL scheme: `/job-description/[role]` (no suffixes)
- [ ] SEO: `seoTitle` ≤60 chars, `metaDescription` ≤150 chars
- [ ] Content: Action-verb responsibilities, capability-based requirements
- [ ] Insights: Salary p25/median/p75, talent signals, skill trends, title variants
- [ ] Templates: Copy-ready JD template with clear sections
- [ ] Data Layer: Explicit JSON for analytics
- [ ] Schema: Valid JobPosting JSON-LD with canonical URL
- [ ] Tone: Crisp, confident, recruiter-centric (Juicebox brand)
- [ ] Bullets: Skimmable, no wall-of-text paragraphs

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

Set environment variable in Vercel dashboard:
- `ANTHROPIC_API_KEY=sk-ant-...`

### Other Platforms

This is a standard Next.js app with Edge Runtime API routes. Deploy to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Railway

Ensure your platform supports:
- Node.js 18+
- Edge Runtime (for `/api/generate` route)

## Advanced: Batch Generation

To generate multiple roles in bulk:

```bash
# Create a roles.json file
cat > roles.json << 'EOF'
[
  "Marketing Manager",
  "Software Engineer",
  "Product Designer",
  "Sales Representative"
]
EOF

# Run batch script (create this script)
node scripts/batch-generate.js
```

Example `scripts/batch-generate.js`:

```javascript
const roles = require('../roles.json');

(async () => {
  for (const role of roles) {
    const res = await fetch('http://localhost:5173/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, locale: 'en-US', estimateSalary: true })
    });
    const data = await res.json();
    console.log(`✓ Generated: ${role}`);
    // Optional: Save to file or push to CMS
  }
})();
```

## Customization

### Brand Tone

Edit the `system` prompt in `app/api/generate/route.ts:30` to adjust tone, style, or requirements.

### Schema Fields

Add/modify fields in `lib/schema.ts` to capture additional data points (e.g., remote eligibility, visa sponsorship).

### Styling

Update Juicebox design tokens in `tailwind.config.ts:6-18` to match your brand colors.

## Troubleshooting

### "ANTHROPIC_API_KEY is not defined"

- Ensure `.env.local` exists with valid API key
- Restart dev server after adding environment variables

### "Schema validation failed"

- Check Claude's output in server logs
- Adjust `system` prompt constraints if needed
- Increase `max_tokens` if output is truncated

### n8n Function Node Error

- Paste the entire `transformForWebflow` function from `lib/n8n-formatter.ts`
- Ensure input is `$input.first().json.data` (adjust if your node structure differs)

## License

Proprietary — Juicebox.ai

## Support

For issues or questions, contact the Juicebox engineering team.
