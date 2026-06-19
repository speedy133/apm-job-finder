# APM Job Finder - Phase-wise Implementation Plan

This document breaks down the development of the APM Job Finder platform into manageable phases based on the defined `context.md` requirements and `architecture.md` design.

## Phase 1: Foundation & Project Setup
*Goal: Establish the initial development environment, project scaffolding, and core infrastructure.*

1. **Repository Setup:**
   - Initialize a monorepo or standard separate folder structure for `frontend/` and `backend/`.
   - Setup Git and basic linting/formatting rules (ESLint, Prettier).

2. **Database Provisioning:**
   - Create a project on Neon (Serverless Postgres).
   - Retrieve connection strings for development and production.

3. **Backend Initialization:**
   - Initialize a Node.js + Express project with TypeScript.
   - Set up standard middlewares (CORS, body-parser, error handling).

4. **Frontend Initialization:**
   - Scaffold a Next.js (App Router) project with TypeScript and Tailwind CSS.
   - Configure custom fonts, color palettes, and global styles.

5. **Authentication Setup:**
   - Set up a Clerk application.
   - Integrate Clerk React SDK into the Next.js frontend.
   - Integrate Clerk Express SDK into the backend to protect secure routes.

---

## Phase 2: Database Design & Data Pipeline
*Goal: Design the database schema and implement the background scripts to aggregate jobs.*

1. **ORM Integration:**
   - Install and configure an ORM (e.g., Prisma or Drizzle ORM) in the backend.
2. **Schema Definition:**
   - Define models for `User`, `Job`, and `SavedJob`.
   - Run initial migrations to create tables in the Neon database.
3. **Data Fetching Logic:**
   - Implement services to connect to public Greenhouse and Lever APIs.
   - Write logic to filter for "Product Management" specific roles.
4. **Data Normalization:**
   - Create adapters that transform external API responses into the local `Job` schema.
5. **Database Upserting:**
   - Implement the logic to insert new jobs and update existing ones (avoiding duplicates).
6. **Automation:**
   - Set up a cron job (using `node-cron` or GitHub Actions) to run the aggregation pipeline periodically (e.g., every 6 hours).

---

## Phase 3: Backend API Development
*Goal: Build the REST API necessary to power the frontend interface.*

1. **Public Job Endpoints:**
   - `GET /api/jobs`: Fetch jobs with support for search (`q`), filtering (`remote`, `location`, `company`), sorting, and pagination.
   - `GET /api/jobs/:id`: Fetch details for a specific job.

2. **Protected User Endpoints (Require Clerk JWT):**
   - `POST /api/users/sync`: Webhook endpoint to sync Clerk user creation into the PostgreSQL `users` table.
   - `POST /api/saved-jobs`: Save a job for the authenticated user.
   - `DELETE /api/saved-jobs/:jobId`: Remove a saved job.
   - `GET /api/saved-jobs`: Retrieve all jobs saved by the user.

3. **API Testing:**
   - Setup basic integration tests (e.g., using Jest and Supertest) to ensure endpoints work correctly.

---

## Phase 4: Frontend UI Development
*Goal: Build the user-facing web application that interacts with the backend.*

1. **Core Layout & Navigation:**
   - Build a responsive navigation bar (with Authentication state toggles) and footer.
   - Implement the Landing Page (Hero section, value proposition, call-to-action).

2. **Job Discovery Interface:**
   - Build the main Job Search Dashboard.
   - Implement the search bar and filter sidebar (Remote toggle, Location dropdown, etc.).
   - Create reusable `JobCard` components to display aggregated jobs.

3. **Job Details & Interaction:**
   - Build the Job Details Page showing full descriptions, metadata, and the "Apply Externally" link.
   - Implement the "Save Job" button logic on job cards and detail pages.

4. **User Profile & Saved Jobs:**
   - Build the "My Saved Jobs" page accessible only to logged-in users.
   - Allow users to review and unsave jobs from this list.

---

## Phase 5: Testing, Polish, & Deployment
*Goal: Ensure the application is stable, aesthetically pleasing, and live on the internet.*

1. **UI/UX Polish:**
   - Add loading skeletons, empty states, and toast notifications (e.g., "Job saved successfully!").
   - Ensure mobile responsiveness across all views.

2. **End-to-End Testing:**
   - Perform manual walk-throughs of the primary user flows (Search -> Filter -> View -> Login -> Save).

3. **Deployment Preparation:**
   - Set up CI/CD pipelines (e.g., GitHub Actions).
   - Configure environment variables for production (Database URL, Clerk Keys, API URLs).

4. **Production Deployment:**
   - Deploy the Node.js Backend (e.g., Render, Railway, or Heroku).
   - Deploy the Next.js Frontend (Vercel).
   - Point the frontend to the production backend URL.

---

## Phase 6: Future Roadmap Execution (V2 & V3)
*Goal: Post-MVP feature expansions.*

1. **V2: Analytics Dashboard:**
   - Build backend queries to aggregate job data (top locations, remote vs. onsite).
   - Add a frontend charting library (e.g., Recharts) to display market insights.

2. **V3: AI Integration:**
   - Implement file uploads for Resumes.
   - Integrate OpenAI/Anthropic APIs to calculate "Job Fit Scores" and generate custom job summaries based on the user's resume.
