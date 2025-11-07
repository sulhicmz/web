# Getting Started with AstroPro Digital

This guide will help you set up and run AstroPro Digital locally, understand the project structure, and get familiar with the key components.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20 LTS** (or >=18.20.8) - Astro 5.x enforces this requirement
- **npm ≥ 9.6.5** (bundled with Node 20) or compatible package manager
- **Supabase CLI 1.150+** with Docker for local database/Auth emulation
- **Cloudflare Wrangler 3+** (optional, for deployment)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sulhicmz/web astropro-digital
   cd astropro-digital
   ```

2. Install dependencies:
   ```bash
   npm ci
   ```

3. Create environment file:
   ```bash
   cp .env.example .env.local
   ```

## Local Development Setup

1. Start the local Supabase stack:
   ```bash
   supabase start
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:4321` to see the application running.

## Project Structure

```
.
├── docs/                   # Documentation and planning files
├── public/                 # Static assets (favicons, fonts)
├── src/
│   ├── components/         # Reusable Astro components
│   ├── layouts/            # Page layout templates
│   ├── lib/                # Shared libraries and utilities
│   ├── pages/              # Route definitions
│   └── content/            # Content collections
├── supabase/               # Database migrations and local setup
│   └── migrations/         # Database schema migrations
├── src/
│   ├── components/         # Reusable Astro components
│   ├── layouts/            # Page layout templates
│   ├── lib/                # Shared libraries and utilities
│   ├── pages/              # Route definitions
│   ├── content/            # Content collections
│   ├── styles/             # Global styles and design tokens
│   └── types/              # TypeScript type definitions
```

## Key Features

### Marketing Site
- SSG marketing, portfolio, and blog content backed by MDX collections
- Responsive design with marketing-focused components
- SEO-optimized structure

### Client Portal
- SSR-protected dashboard for projects, billing, and support
- Supabase authentication with role-based access control
- Project management and billing features

### Payment Integration
- Midtrans provider abstraction
- Checkout session API
- Webhook validation and processing

## Next Steps

- Review the [Project Architecture](./architecture.md) for detailed technical information
- Check the [Deployment Guide](./deployment.md) for production setup instructions
- Explore the [API Reference](./api-reference.md) for available endpoints