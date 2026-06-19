"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { BriefcaseBusiness, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 on new search
    router.push(`/?${params.toString()}`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-black/80 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 hidden sm:block">
            APM Finder
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="flex flex-1 items-center justify-center px-6">
          <form onSubmit={handleSearch} className="w-full max-w-md relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="block w-full rounded-full border-0 bg-zinc-100 py-2 pl-10 pr-4 text-zinc-900 shadow-inner ring-1 ring-inset ring-zinc-200/50 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-zinc-900 dark:text-white dark:ring-zinc-800 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950 transition-all"
              placeholder="Search companies or roles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </form>
        </div>

        {/* Auth & Navigation Section */}
        <div className="flex items-center gap-4">
          {isSignedIn && (
            <Link 
              href="/saved" 
              className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
            >
              Saved Jobs
            </Link>
          )}
          {isSignedIn ? (
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900">
              <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-full shadow-md shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
}
