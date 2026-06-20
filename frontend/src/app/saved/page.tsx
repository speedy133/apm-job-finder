"use client";

import JobCard from "@/components/JobCard";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { Loader2, BookmarkX } from "lucide-react";
import { useUser, RedirectToSignIn } from "@clerk/nextjs";

export default function SavedJobsPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { savedJobs, isLoading, isError } = useSavedJobs();

  if (isLoaded && !isSignedIn) {
    return <RedirectToSignIn />;
  }

  return (
    <main className="flex-1 w-full mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 border-b border-zinc-200/50 pb-6 dark:border-zinc-800/50">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Saved Jobs
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Keep track of the PM roles you are interested in applying to.
          </p>
        </div>

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-500/20 dark:bg-red-500/10">
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              Failed to load your saved jobs.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}

        {/* Data State */}
        {savedJobs && savedJobs.length > 0 && (
          <div className="flex flex-col gap-4">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {savedJobs && savedJobs.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 py-32 dark:border-zinc-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
              <BookmarkX size={24} className="text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No saved jobs</h3>
            <p className="mt-1 max-w-sm text-center text-sm text-zinc-500 dark:text-zinc-400">
              You haven&apos;t saved any jobs yet. Browse the feed and click the heart icon to save jobs here!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
