# Webflow CMS Setup Guide

Complete step-by-step guide for setting up the Webflow CMS to receive role job description data from the Juicebox JD Generator.

## Overview

This integration uses:
- **Next.js API** → Generates JD JSON
- **n8n workflow** → Transforms & publishes to Webflow
- **Webflow CMS** → Stores & renders `/job-description/[role]` pages

## Part 1: Create CMS Collection

### 1.1 Create Collection

1. Go to Webflow CMS → Collections
2. Click **"+ New Collection"**
3. Name: **"Role Job Descriptions"**
4. Collection slug: `role-job-descriptions`

### 1.2 Add Collection Fields

Add these fields in order:

#### Core Fields

| Field Name | Type | Required | Settings |
|------------|------|----------|----------|
| **Name** | Plain Text | ✓ | Default: "Job Description" |
| **Slug** | Plain Text | ✓ | Auto-generate from Name |
| **Role** | Plain Text | ✓ | — |

#### SEO Fields

| Field Name | Type | Required | Max Length |
|------------|------|----------|------------|
| **SEO Title** | Plain Text | ✓ | 60 chars |
| **Meta Description** | Plain Text | ✓ | 160 chars |
| **Canonical URL** | Plain Text | ✓ | — |

#### Keyword Fields

| Field Name | Type | Required |
|------------|------|----------|
| **Primary Keyword** | Plain Text | ✓ |
| **Secondary Keywords** | Plain Text | — |
| **Long Tail Keywords** | Plain Text | — |

#### Content Fields (Rich Text)

| Field Name | Type | Required | Format |
|------------|------|----------|--------|
| **Summary** | Rich Text | ✓ | Plain paragraph |
| **Responsibilities** | Rich Text | ✓ | HTML bullets |
| **Requirements Must** | Rich Text | ✓ | HTML bullets |
| **Requirements Nice** | Rich Text | — | HTML bullets |
| **Benefits** | Rich Text | — | HTML bullets |

#### Data Insight Fields (JSON as Plain Text)

| Field Name | Type | Required | Format |
|------------|------|----------|--------|
| **Salary Insights** | Plain Text | — | JSON string |
| **Talent Signals** | Plain Text | — | JSON string |
| **Skill Trends** | Plain Text | — | CSV |
| **Title Variants** | Plain Text | — | CSV |

#### Template & CTA

| Field Name | Type | Required | Format |
|------------|------|----------|--------|
| **JD Template** | Rich Text | ✓ | HTML sections |
| **Application CTA** | Plain Text | ✓ | Text link |

#### Technical Fields

| Field Name | Type | Required | Format |
|------------|------|----------|--------|
| **Data Layer** | Plain Text | — | JSON string |
| **JobPosting Schema** | Plain Text | ✓ | JSON-LD string |
| **Published At** | Date | — | ISO timestamp |

### 1.3 Collection Settings

1. **Collection Page URL**: `/job-description/:slug`
2. **Collection Template**: Create new template (see Part 2)
3. **SEO Settings**:
   - Title Tag Source: `SEO Title`
   - Meta Description Source: `Meta Description`

## Part 2: Design Collection Template

### 2.1 Create Template Page

1. Go to **Pages** → **Collection Pages**
2. Select **"Role Job Descriptions"** collection
3. Design your template page

### 2.2 Recommended Layout

```
Header
├── H1: {Role}
└── Badge: "Job Description"

Summary Section
└── P: {Summary} (Rich Text)

Responsibilities Section
├── H2: "Key Responsibilities"
└── {Responsibilities} (Rich Text with bullets)

Requirements Section
├── H2: "Requirements"
├── H3: "Must Have"
├── {Requirements Must} (Rich Text with bullets)
├── H3: "Nice to Have"
└── {Requirements Nice} (Rich Text with bullets)

Benefits Section (if present)
├── H2: "Benefits"
└── {Benefits} (Rich Text with bullets)

Salary Insights Section
├── H2: "Salary Insights"
└── Custom Embed (parse JSON - see 2.3)

JD Template Section
├── H2: "Ready-to-Use Template"
├── {JD Template} (Rich Text)
└── Button: "Copy Template" (see 2.4)

CTA Section
└── Button: {Application CTA}

Footer
```

### 2.3 Parse Salary Insights (Custom Code)

Add a **Custom Code Embed** to display salary data:

```html
<div id="salary-widget"></div>

<script>
  // Get the JSON string from Webflow CMS field
  const salaryJSON = document.querySelector('[data-salary-insights]').textContent;

  if (salaryJSON && salaryJSON.trim()) {
    try {
      const data = JSON.parse(salaryJSON);
      const widget = document.getElementById('salary-widget');

      if (data.median) {
        widget.innerHTML = `
          <div class="salary-range">
            <div class="salary-item">
              <span class="label">25th Percentile</span>
              <span class="value">${data.currency || '$'}${data.p25?.toLocaleString()}</span>
            </div>
            <div class="salary-item highlight">
              <span class="label">Median</span>
              <span class="value">${data.currency || '$'}${data.median.toLocaleString()}</span>
            </div>
            <div class="salary-item">
              <span class="label">75th Percentile</span>
              <span class="value">${data.currency || '$'}${data.p75?.toLocaleString()}</span>
            </div>
            <span class="period">per ${data.period || 'year'}</span>
          </div>
        `;
      }
    } catch (e) {
      console.error('Failed to parse salary data:', e);
    }
  }
</script>
```

**Field Binding:**
- Add a hidden div with `data-salary-insights` attribute
- Bind it to the `{Salary Insights}` CMS field

### 2.4 Copy JD Template Button

Add a button with this custom code:

```html
<button id="copy-template-btn" class="btn-copy">
  📋 Copy Template
</button>

<script>
  document.getElementById('copy-template-btn').addEventListener('click', () => {
    const template = document.querySelector('[data-jd-template]').innerText;
    navigator.clipboard.writeText(template).then(() => {
      alert('Template copied to clipboard!');
    });
  });
</script>
```

**Field Binding:**
- Wrap your `{JD Template}` Rich Text in a div with `data-jd-template` attribute

### 2.5 Inject JSON-LD Schema

In **Page Settings** → **Custom Code** → **Before `</head>` tag**:

```html
<link rel="canonical" href="{Canonical URL}">

<script type="application/ld+json">
{JobPosting Schema}
</script>

<!-- Optional: Data Layer for Analytics -->
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({JSON from Data Layer field});
</script>
```

**Field Bindings:**
- `{Canonical URL}` → Bind CMS field
- `{JobPosting Schema}` → Bind CMS field (raw JSON)
- `{JSON from Data Layer field}` → Bind CMS field

## Part 3: n8n Workflow Setup

### 3.1 Create New Workflow

1. Open n8n
2. Create workflow: **"Juicebox JD Publisher"**

### 3.2 Node 1: Trigger (Airtable/Google Sheets)

**Node Type:** `Airtable Trigger` or `Google Sheets Trigger`

**Trigger On:** New row created

**Expected Columns:**
- `role` (text)
- `locale` (text, default: "en-US")
- `estimateSalary` (checkbox/boolean)

### 3.3 Node 2: HTTP Request

**Node Type:** `HTTP Request`

**Settings:**
- Method: `POST`
- URL: `https://your-app.vercel.app/api/generate`
- Authentication: None
- Body Content Type: `JSON`

**Request Body:**
```json
{
  "role": "={{ $json.role }}",
  "locale": "={{ $json.locale || 'en-US' }}",
  "estimateSalary": "={{ $json.estimateSalary || false }}"
}
```

### 3.4 Node 3: Function (Transform)

**Node Type:** `Function`

**Code:** (Paste from `lib/n8n-formatter.ts`)

```javascript
// Helper: Convert array to HTML bullets
function arrayToHtml(items) {
  if (!items || items.length === 0) return '';
  const listItems = items.map(item => `  <li>${item}</li>`).join('\n');
  return `<ul>\n${listItems}\n</ul>`;
}

// Helper: Format JD template
function formatJdTemplate(template) {
  let html = `<h2>${template.title}</h2>\n<p>${template.intro}</p>\n\n`;

  for (const section of template.sections) {
    html += `<h3>${section.heading}</h3>\n`;
    html += arrayToHtml(section.bullets);
    html += '\n\n';
  }

  return html.trim();
}

// Main transform
const apiResponse = $input.first().json.data;
const now = new Date().toISOString();

if (!apiResponse.dataLayer.publishedAtISO) {
  apiResponse.dataLayer.publishedAtISO = now;
}

return {
  json: {
    name: `Job Description — ${apiResponse.role}`,
    slug: apiResponse.slug,
    role: apiResponse.role,

    'seo-title': apiResponse.seoTitle,
    'meta-description': apiResponse.metaDescription,
    'canonical-url': apiResponse.url,

    'primary-keyword': apiResponse.keywords.primary,
    'secondary-keywords': apiResponse.keywords.secondary.join(', '),
    'long-tail-keywords': apiResponse.keywords.longTails.join(', '),

    summary: apiResponse.summary,
    responsibilities: arrayToHtml(apiResponse.responsibilities),
    'requirements-must': arrayToHtml(apiResponse.requirementsMust),
    'requirements-nice': arrayToHtml(apiResponse.requirementsNice),
    benefits: arrayToHtml(apiResponse.benefits),

    'salary-insights': apiResponse.salaryInsights ? JSON.stringify(apiResponse.salaryInsights) : '',
    'talent-signals': apiResponse.talentSignals ? JSON.stringify(apiResponse.talentSignals) : '',
    'skill-trends': apiResponse.skillTrends.join(', '),
    'title-variants': apiResponse.titleVariants.join(', '),

    'jd-template': formatJdTemplate(apiResponse.jdTemplate),
    'application-cta': apiResponse.applicationCTA,

    'data-layer': JSON.stringify(apiResponse.dataLayer),
    'job-posting-schema': JSON.stringify(apiResponse.jobPostingSchema, null, 2),

    'published-at': apiResponse.dataLayer.publishedAtISO,

    _archived: false,
    _draft: false
  }
};
```

### 3.5 Node 4: Webflow CMS

**Node Type:** `Webflow`

**Operation:** `Create Item` (or `Update Item` if checking for duplicates)

**Settings:**
- Site: Select your Webflow site
- Collection: `Role Job Descriptions`
- Live: `true` (publishes immediately)

**Field Mapping:** Auto-mapped from Function node output

### 3.6 Test Workflow

1. Add test row to Airtable/Sheets:
   - `role`: "Marketing Manager"
   - `locale`: "en-US"
   - `estimateSalary`: `true`

2. Execute workflow manually
3. Check Webflow CMS for new item
4. Visit live page: `https://yoursite.com/job-description/marketing-manager`

## Part 4: Bulk Publishing

### Option A: CSV Import to n8n

1. Create `roles.csv`:
```csv
role,locale,estimateSalary
Marketing Manager,en-US,true
Software Engineer,en-US,true
Product Designer,en-GB,false
```

2. Upload to Google Sheets
3. n8n will process each row

### Option B: Direct API Calls

Use batch script (see README.md) to call API directly, then push to Webflow via their API.

## Troubleshooting

### CMS Item Not Created

- Check n8n execution logs
- Verify Webflow API credentials
- Ensure collection field names match exactly (case-sensitive!)

### JSON-LD Not Rendering

- Ensure `{JobPosting Schema}` field contains valid JSON
- Check browser console for parsing errors
- Validate JSON at [schema.org validator](https://validator.schema.org/)

### Bullets Not Showing

- Verify Rich Text fields accept HTML
- Check that arrays are converted to `<ul><li>` format in Function node

### Salary Widget Empty

- Confirm `Salary Insights` field has valid JSON string
- Check custom code for parsing errors (browser console)
- Ensure `estimateSalary: true` in API request

## Next Steps

1. **Add more roles**: Scale to hundreds of role pages
2. **Enrich data**: Replace placeholder insights with live API data
3. **A/B testing**: Test different CTA variations
4. **Analytics**: Track conversions via Data Layer events
5. **Localization**: Generate en-GB, de-DE variants

## Support

For Webflow-specific questions, see [Webflow CMS API docs](https://developers.webflow.com/reference/cms).

For n8n help, see [n8n Webflow integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.webflow/).
