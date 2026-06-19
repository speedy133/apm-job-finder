"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isRemoteOnly = searchParams.get("remote") === "true";

  const handleRemoteToggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isRemoteOnly) {
      params.delete("remote");
    } else {
      params.set("remote", "true");
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-900/50 dark:ring-zinc-800/50">
        <h2 className="text-sm font-semibold leading-6 text-zinc-900 dark:text-zinc-100">Filters</h2>
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-500 dark:border-zinc-700 dark:checked:border-indigo-500 dark:checked:bg-indigo-500"
                checked={isRemoteOnly}
                onChange={handleRemoteToggle}
              />
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200 transition-colors">
              Remote Only
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
