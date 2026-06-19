"use client";

import { Job } from "@/hooks/useJobs";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { formatDistanceToNow } from "date-fns";
import { Heart, MapPin, Building2, Globe2, ExternalLink } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export default function JobCard({ job }: { job: Job }) {
  const { isSignedIn } = useUser();
  const { savedJobs, toggleSave } = useSavedJobs();

  const isSaved = savedJobs.some((j) => j.id === job.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to job URL if the card is a link
    toggleSave(job.id);
  };

  const formattedDate = formatDistanceToNow(new Date(job.createdAt), { addSuffix: true });

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 dark:bg-zinc-900/50 dark:ring-zinc-800/50 dark:hover:shadow-indigo-900/20">
      
      {/* Save Button (Absolute Top Right) */}
      <div className="absolute right-4 top-4 z-10">
        {isSignedIn ? (
          <button 
            onClick={handleSaveClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all hover:bg-red-50 hover:text-red-500 active:scale-90 dark:bg-zinc-800 dark:hover:bg-red-500/10"
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <Heart size={20} className={cn("transition-colors", isSaved && "fill-red-500 text-red-500")} />
          </button>
        ) : (
          <SignInButton mode="modal">
            <button 
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              aria-label="Sign in to save"
            >
              <Heart size={20} />
            </button>
          </SignInButton>
        )}
      </div>

      <div>
        <div className="flex items-center gap-x-3 text-xs">
          <time dateTime={job.createdAt} className="text-zinc-500 dark:text-zinc-400">
            {formattedDate}
          </time>
          {job.remote_status && (
            <span className="relative z-10 rounded-full bg-green-50 px-3 py-1 font-medium text-green-600 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
              Remote
            </span>
          )}
          <span className="relative z-10 rounded-full bg-zinc-50 px-3 py-1 font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700">
            {job.source}
          </span>
        </div>
        
        <div className="group relative mt-4 max-w-xl">
          <h3 className="text-xl font-semibold leading-6 text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400 transition-colors pr-12">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <span className="absolute inset-0" />
              {job.title}
            </a>
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {job.description.replace(/(<([^>]+)>)/gi, "") /* Strip HTML for preview */}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-4">
        <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Building2 size={16} />
            <span className="font-medium text-zinc-900 dark:text-zinc-200">{job.company}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {job.remote_status ? <Globe2 size={16} /> : <MapPin size={16} />}
            <span>{job.location}</span>
          </div>
        </div>
        
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative z-10 flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white"
        >
          Apply <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
