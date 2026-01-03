# Tech Stack: SuburbMates Melbourne

## 1. Overview

This document outlines the core technologies and libraries used in the SuburbMates Melbourne project. The selections prioritize modern web development practices, scalability, developer experience, and maintainability.

## 2. Core Technologies

*   **Frontend Framework:** Next.js 16 (App Router)
    *   **Rationale:** Provides server-side rendering (SSR), static site generation (SSG), and API routes, optimizing performance and SEO. The App Router facilitates a more structured and modern approach to building web applications.
*   **Programming Language:** TypeScript 5
    *   **Rationale:** Offers static typing for improved code quality, readability, and maintainability, reducing bugs and enhancing developer productivity.
*   **UI Library:** React 19
    *   **Rationale:** A declarative and component-based library for building interactive user interfaces, ensuring a rich and responsive user experience.

## 3. Styling and Design System

*   **Styling Framework:** Tailwind CSS 3.4
    *   **Rationale:** A utility-first CSS framework that enables rapid UI development and highly customizable designs, aligning with the "Premium Minimalism" design philosophy.
*   **UI Components:**
    *   `lucide-react`: Icon library for clear and consistent iconography.
    *   `framer-motion`: For fluid and engaging animations, enhancing user interaction.
    *   `clsx`, `tailwind-merge`, `cva` (Class Variance Authority): Utilities for managing dynamic class names and building reusable, variant-based components.
    *   `@shadcn/ui`: Integration for high-quality, accessible UI components.

## 4. Backend & Infrastructure

*   **Database & Authentication:** Supabase (PostgreSQL + RLS)
    *   **Rationale:** Provides a powerful PostgreSQL database with Row Level Security (RLS) for robust data management and secure, integrated authentication solutions, reducing backend development overhead.
*   **Payments:** Stripe
    *   **Rationale:** Industry-leading platform for secure and scalable payment processing, essential for the marketplace functionality.
*   **Transactional Emails:** Resend
    *   **Rationale:** For efficient and reliable sending of transactional emails (e.g., order confirmations, notifications).

## 5. Development Utilities

*   **Schema Validation:** Zod
    *   **Rationale:** TypeScript-first schema declaration and validation library, ensuring data integrity and type safety across the application.

## 6. Observability & Testing

*   **End-to-End Testing:** Playwright
    *   **Rationale:** A robust framework for reliable end-to-end testing across modern web browsers, ensuring application functionality.
*   **Unit Testing:** Vitest
    *   **Rationale:** A fast and modern unit testing framework for testing individual components and functions.
*   **Analytics:** PostHog
    *   **Rationale:** For product analytics and user behavior tracking, informing future development decisions.
*   **Error Monitoring:** Sentry
    *   **Rationale:** Real-time error tracking and performance monitoring to proactively identify and resolve issues.

## 7. Key Project Dependencies

*   `next-seo`: For managing SEO metadata, crucial for discoverability.
*   `react-hot-toast`: For intuitive and user-friendly notifications.

## 8. Localization & Content



*   **Language:** Australian English (en-AU)

    *   **Rationale:** All user-facing content, including UI text, error messages, and documentation, must use Australian English to ensure consistency and cater to the primary target audience in Melbourne.



## 9. Database & Automation Infrastructure



*   **Schema Management:** SQL migrations located in `supabase/migrations/`.

*   **Type Safety Automation:** `scripts/generate-types.sh` for generating TypeScript interfaces from the remote schema.

*   **Enforcement States:** Pre-integrated fields in `profiles` for the 4-step automated escalation ladder (Warn, Delist, Suspend, Evict).
