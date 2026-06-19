# APM Job Finder - Edge Cases & Corner Scenarios

This document outlines potential edge cases and corner scenarios that must be handled to ensure the APM Job Finder platform is robust, secure, and provides a seamless user experience.

## 1. Data Aggregation & Pipeline Edge Cases

### 1.1 Source API Unavailability & Rate Limits
- **Scenario:** Greenhouse or Lever APIs go down, return 500 errors, or we hit their API rate limits.
- **Handling:** The cron job should implement exponential backoff and retry logic. If a source fails completely, the pipeline should still process the other sources without failing the entire batch.

### 1.2 "Zombie" Job Postings (Stale Data)
- **Scenario:** A company closes a job or removes it from Greenhouse/Lever. Since the API only returns *active* jobs, we might never receive a "deleted" event, leaving closed jobs visible on our platform.
- **Handling:** Implement a "sync mechanism" where any job in our database that hasn't been re-fetched or "seen" in the last 48-72 hours is automatically marked as `status = 'closed'` or `is_active = false`.

### 1.3 False Positives in Role Filtering
- **Scenario:** Our filter searches for "Product", but catches unrelated roles like "Product Designer", "Product Marketing Manager", or "Productivity Engineer".
- **Handling:** Maintain a strict negative keyword exclusion list (e.g., `NOT "Designer"`, `NOT "Marketing"`, `NOT "Engineer"`) alongside positive keyword matching.

### 1.4 Missing or Malformed Data
- **Scenario:** A job posting is missing a crucial field (e.g., empty location, null description, or missing company name).
- **Handling:** The normalization script must provide sensible defaults (e.g., Location: "Not Specified") and drop/skip postings that lack absolute mandatory fields (like Job Title or Application URL).

### 1.5 Duplicate Postings
- **Scenario:** A company posts the exact same role multiple times, or cross-posts it on both Greenhouse and Lever.
- **Handling:** Implement a deduplication strategy during ingestion, generating a unique hash based on `Company Name + Job Title + Location` to merge or discard duplicates.

---

## 2. Backend API & Database Scenarios

### 2.1 Overlapping Cron Jobs
- **Scenario:** The data ingestion process takes 15 minutes, but the cron job is scheduled to run every 10 minutes. This causes overlapping processes that try to upsert the same data concurrently.
- **Handling:** Use a database lock or a state flag (e.g., in Redis or a `system_config` table) to prevent a new cron instance from starting if the previous one is still running.

### 2.2 Unoptimized Search Queries
- **Scenario:** A user searches for a highly common stop-word like "the" or "and", causing a massive, unindexed table scan that degrades database performance.
- **Handling:** Enforce a minimum character limit for search queries (e.g., 3 characters), strip common stop-words, and ensure PostgreSQL Full-Text Search (TSVECTOR) indexes are properly applied.

### 2.3 Cross-Site Scripting (XSS) in Job Descriptions
- **Scenario:** Greenhouse/Lever APIs return rich HTML for job descriptions, which might contain malicious `<script>` tags injected by the poster.
- **Handling:** The backend must sanitize all HTML job descriptions (e.g., using `DOMPurify` or `sanitize-html`) before storing them, or the frontend must sanitize them before rendering via `dangerouslySetInnerHTML`.

---

## 3. Frontend & User Experience Scenarios

### 3.1 Network Disconnection During Action
- **Scenario:** A user clicks "Save Job" while riding the subway and momentarily loses internet connection.
- **Handling:** The UI should handle the failed request gracefully, reverting the "Saved" icon back to its original state (optimistic UI rollback) and displaying a toast notification: "Network error. Could not save job."

### 3.2 Pagination Shift During Ingestion
- **Scenario:** A user is browsing page 2 of the job results. At that exact moment, the cron job inserts 50 new jobs. When the user clicks "Page 3", the offset shifts, causing them to see duplicate jobs they already saw on page 2.
- **Handling:** Instead of basic `OFFSET/LIMIT` pagination, implement cursor-based pagination (e.g., `last_job_id` or `created_at` timestamp) to ensure stable pagination regardless of new inserts.

### 3.3 JWT Expiration Mid-Session
- **Scenario:** The user's Clerk JWT expires while they are reading a long job description. They click "Save Job", sending an expired token to the backend.
- **Handling:** The backend returns a `401 Unauthorized`. The frontend should catch this specific error, use the Clerk SDK to silently refresh the token, and automatically retry the original request without user interruption.

---

## 4. Authentication & Data Integrity

### 4.1 Orphaned User Data
- **Scenario:** A user deletes their account entirely via the Clerk dashboard, but their records still exist in our `users` and `saved_jobs` tables.
- **Handling:** Implement a Clerk Webhook listener (e.g., `user.deleted` event) to automatically cascade delete the user's records from our PostgreSQL database to comply with data privacy laws (GDPR/CCPA).

### 4.2 Concurrent "Save" Actions
- **Scenario:** A user rapidly double-clicks the "Save Job" button, firing two identical POST requests concurrently.
- **Handling:** The backend should use an `ON CONFLICT DO NOTHING` clause (or equivalent in Prisma/Drizzle) on the `saved_jobs` junction table to prevent unique constraint errors and gracefully return success for both requests.

---

## 5. Future Roadmap Edge Cases (V2 & V3)

### 5.1 Huge Resume Parsing Overhead
- **Scenario (V3):** Multiple users upload 10-page PDF resumes simultaneously, exhausting server memory and crashing the Node.js backend.
- **Handling:** Offload PDF parsing to a background worker queue (e.g., BullMQ) or serverless function with a hard limit on file size (e.g., 2MB) and page count.

### 5.2 AI Hallucinations in Job Summaries
- **Scenario (V3):** The AI feature hallucinates and tells the user a job offers "$200,000" or is "Fully Remote" when the original description says the opposite.
- **Handling:** Add strict system prompts to the LLM. Display a clear disclaimer to the user: "AI-generated summary. Always verify details in the full job description."
