# Project Architecture

This document provides an overview of the AstroPro Digital architecture, including the technology stack, data flow, and system components.

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | [Astro 5](https://astro.build) | Static site generation and server-side rendering |
| Components | Islands Architecture (Solid) | Interactive UI components |
| Styling | Custom CSS with design tokens | Tailwind-inspired styling system |
| Auth & Data | [Supabase](https://supabase.com) | Authentication, database (Postgres), and storage |
| Hosting | [Cloudflare Workers/Pages](https://developers.cloudflare.com/pages) | Deployment and edge execution |
| Payments | Midtrans Snap | Payment processing (one-time & subscription) |
| Analytics | Plausible (optional) | Privacy-friendly analytics |
| Tooling | TypeScript, npm, Playwright (planned) | Development and testing |

## System Components

### Frontend Architecture

The frontend is built using Astro's hybrid rendering approach:

- **Static Site Generation (SSG)**: Marketing pages, portfolio, and blog content are pre-built at build time
- **Server-Side Rendering (SSR)**: Client portal pages are rendered on-demand with user authentication

### Authentication & Authorization

The system implements a role-based access control (RBAC) system with the following roles:

- **Owner**: Full access to all features and settings
- **Staff**: Project management and client communication
- **Client**: Access to their projects and billing information
- **Viewer**: Read-only access to specific projects

Authentication is handled by Supabase with Row-Level Security (RLS) policies.

### Data Flow

1. **User Authentication**: Users authenticate through Supabase Auth
2. **Session Management**: Sessions are maintained server-side through Cloudflare Workers
3. **Data Access**: Database queries go through Supabase with RLS policies
4. **Payment Processing**: Payment requests are processed through Midtrans with webhook validation
5. **Content Delivery**: Static assets are served through Cloudflare's global CDN

### Directory Structure

```
src/
├── components/
│   ├── marketing/          # Marketing site components
│   ├── portal/             # Client portal components
│   └── ui/                 # Shared UI components
├── layouts/                # Page layout templates
├── lib/
│   ├── payments/           # Payment provider implementations
│   └── supabase/           # Supabase client helpers
├── pages/                  # Route definitions and API handlers
├── content/                # Content collections configuration
└── styles/                 # Global styles and design tokens
```

## API Structure

The application exposes several API endpoints grouped by functionality. For a comprehensive list and details, please see the [API Reference](./api-reference.md). Key endpoint groups include:

- `/api/payments/*` - Payment processing, webhooks, and subscriptions.
- `/api/portal/*` - Client portal data, such as projects.
- `/api/user/*` - User profile management.
- `/api/support/*` - Support ticket system.
- `/api/billing/*` - Billing and invoice information.
- `/api/notifications/*` - Outbound notifications.

## Security Considerations

- All database access is protected by Supabase Row-Level Security (RLS)
- API keys and sensitive credentials are stored as environment variables
- Payment webhooks are validated using provider-specific signatures
- Cross-site request forgery (CSRF) protection is implemented where appropriate
- Input validation is performed on all user inputs