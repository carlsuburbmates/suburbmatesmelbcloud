# SuburbMates Melbourne

**SuburbMates Melbourne** is a localized, mobile-first "Directory + Marketplace" designed to connect digital creators with local buyers. It operates on a strict "Middleman Truth" architecture, acting as a high-trust discovery layer rather than a merchant of record, and is governed by a "Premium Minimalism" design constitution that rejects generic AI templates in favor of editorial craft.

## Platform Logic

A comprehensive synthesis of the platform’s logic, taxonomy, and operational rules can be found in [docs/platform-logic.md](docs/platform-logic.md). This document is essential for understanding the core principles and architecture of the project.

The API documentation can be found in [docs/api.md](docs/api.md).

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI Library:** React 19

### Styling & Design System
- **Engine:** Tailwind CSS 3.4
- **Icons:** lucide-react
- **Animations:** framer-motion
- **Utilities:** clsx, tailwind-merge, cva (Class Variance Authority)
- **Components:** Hints of @shadcn/ui integration.

### Backend & Infrastructure
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **Payments:** Stripe (Connect/Marketplace)
- **Emails:** Resend
- **Validation:** Zod (Schema validation)

### Observability & Testing
- **E2E Testing:** Playwright
- **Unit Testing:** Vitest
- **Analytics:** PostHog
- **Error Monitoring:** Sentry

### Key Dependencies
- **next-seo:** SEO Management
- **react-hot-toast:** Notifications

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Supabase Account](https://supabase.io/)

### Installing

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/suburbmatesmelb.git
    cd suburbmatesmelb
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` in the root of the project and add the following environment variables. You can get these values from your Supabase project settings.

    ```
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Set up the Supabase database:**

    Go to the SQL Editor in your Supabase project and run the SQL commands from the following files:

    -   `supabase/schema.sql`: This will create the necessary tables and policies.
    -   `supabase/seed.sql`: This will seed the database with initial data for categories.

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

Add notes about how to use the system.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
