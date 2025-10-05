# GEMINI.md

## Project Overview

This is the repository for "AstroPro Digital," a comprehensive web project that includes both a marketing website and a client portal. The project is built on a modern, serverless architecture, leveraging the following key technologies:

*   **Frontend:** [Astro](https://astro.build/) is used for the frontend, with a hybrid rendering approach. The marketing site is statically generated (SSG) for optimal performance, while the client portal is server-side rendered (SSR) to handle dynamic, user-specific content. [Solid.js](https://www.solidjs.com/) is used for interactive UI components ("islands"), and the styling is inspired by [Tailwind CSS](https://tailwindcss.com/). Content is managed using [MDX](https://mdxjs.com/).
*   **Backend:** [Supabase](https://supabase.com/) provides the backend infrastructure, including the PostgreSQL database, user authentication, and row-level security.
*   **Hosting:** The entire application is deployed to [Cloudflare Workers](https://workers.cloudflare.com/), a serverless execution environment.
*   **Payments:** [Midtrans](https://midtrans.com/) is integrated for handling payments.
*   **Analytics:** [Plausible](https://plausible.io/) is used for privacy-focused analytics.
*   **Language:** The project is written in [TypeScript](https://www.typescriptlang.org/).

## Building and Running

The following commands are essential for working with this project:

*   **`npm ci`**: Installs the exact versions of the dependencies specified in `package-lock.json`. Use this instead of `npm install` to ensure reproducible builds.
*   **`supabase start`**: Starts the local Supabase stack, which includes a local instance of the Postgres database and the Supabase Studio.
*   **`npm run dev`**: Starts the Astro development server, allowing you to see your changes in real-time with hot-reloading.
*   **`npm run build`**: Creates a production-ready build of the application.
*   **`npm run preview`**: Starts a local server to preview the production build.
*   **`npm run check`**: Performs a full check of the project, including a production build, TypeScript type-checking, and a dry-run deployment to Cloudflare.
*   **`npm run deploy`**: Deploys the application to Cloudflare Workers.

## Development Conventions

*   **Environment Variables:** Local environment variables are managed in a `.env.local` file. This file is not committed to version control. You can create it by copying the `.env.example` file.
*   **Commit Messages:** Commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps to maintain a clear and consistent commit history.
*   **Contribution Guidelines:** The `CONTRIBUTING.md` file provides detailed guidelines for contributing to the project, including the branching strategy and pull request process.
*   **Project Documentation:** The `docs` directory contains a wealth of information about the project, including the product strategy, design components, and architecture. The `howto.md` file provides a comprehensive guide to setting up and deploying the project.
*   **Testing:** The project is set up for testing with [Playwright](https://playwright.dev/) (though tests are yet to be implemented).
