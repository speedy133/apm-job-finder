"use client";

import FilterSidebar from "@/components/FilterSidebar";
import JobCard from "@/components/JobCard";
import Pagination from "@/components/Pagination";
import { useJobs } from "@/hooks/useJobs";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const remote = searchParams.get("remote") === "true";

  const { data, isLoading, isError } = useJobs(page, search, remote);

  return (
    <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <FilterSidebar />

        {/* Job Feed */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {search ? `Search results for "${search}"` : "Latest PM Jobs"}
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {data ? `${data.totalCount} jobs found` : "Loading..."}
            </p>
          </div>

          {/* Error State */}
          {isError && (
            <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-500/20 dark:bg-red-500/10">
              <p className="text-sm font-medium text-red-800 dark:text-red-400">
                Failed to load jobs. Please make sure the backend server is running!
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !data && (
            <div className="flex flex-1 items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}

          {/* Data State */}
          {data && data.jobs.length > 0 && (
            <div className="flex flex-col gap-4">
              {data.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {data && data.jobs.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 py-20 dark:border-zinc-800">
              <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">No jobs found</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={data.page} totalPages={data.totalPages} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
