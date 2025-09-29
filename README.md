# Flowboost

An SEO automation tool designed specifically for Webflow users, addressing the limitations of Webflow's native SEO features by providing automated crawling, issue fixing, internal linking, and programmatic content generation.

## Features

- **SEO Health Audit**: Automated crawling of up to 50K pages with issue detection
- **One-Click Fixes**: Automated PATCH requests via Webflow API for common issues
- **Internal Link Engine**: Keyword-based link suggestions and injections
- **Programmatic SEO Builder**: Template creation for CMS collections
- **Reporting & Alerts**: Daily/weekly digests via email or Slack

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Puppeteer for crawling
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Integrations**: Webflow Data API v2, Google Search Console API, Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Webflow account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/flowboost.git
cd flowboost
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Fill in your environment variables:
- Supabase URL and keys
- Webflow OAuth credentials
- Stripe keys (for billing)

4. Set up the database:
Run the SQL schema in `supabase/schema.sql` in your Supabase project.

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   └── api/              # API routes
├── components/           # React components
│   ├── layout/          # Layout components
│   └── ui/              # UI components
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Supabase client
│   ├── webflow.ts      # Webflow API integration
│   └── crawler.ts      # SEO crawler logic
└── types/              # TypeScript type definitions
```

## Development

### Database Schema

The application uses the following main tables:
- `users`: User accounts and roles
- `sites`: Connected Webflow sites
- `seo_issues`: Detected SEO issues
- `webflow_tokens`: OAuth tokens for Webflow API

### API Routes

- `/api/auth/webflow`: Webflow OAuth integration
- `/api/crawl/[siteId]`: Trigger site crawls
- `/api/fixes/apply`: Apply SEO fixes

## Deployment

The application is designed to be deployed on Vercel with Supabase as the backend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.