"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import SearchInput from "./SearchInput";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
        {/* --- Left section: Logo and nav links --- */}
        <div className="flex  sm:flex-row sm:items-center gap-4 md:gap-6">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            MyBlog
          </Link>

          <nav className="flex-1  m-auto  sm:justify-center  gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 flex justify-end"
            >
              Home
            </Link>
          </nav>
          {status === "authenticated" && session?.user?.role === "admin" && (
            <Link
              href="/dashboard/categories"
              className="text-gray-600 hover:text-gray-900 m-auto"
            >
              Categories
            </Link>
          )}
        </div>

        {/* --- Right section: Search + Auth --- */}
        <div className="flex flex-col  md:flex-row md:items-center gap-4 w-full md:w-auto">
          {/* --- Search Input --- */}
          <div className="w-full md:w-64 flex justify-center">
            <SearchInput />
          </div>

          {/* --- Auth Buttons or User Info --- */}
          {status === "loading" ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : status === "authenticated" ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-gray-700 ">
                Welcome, {session.user?.name?.split(" ")[0]}!
              </span>
              <Link href="/dashboard/posts">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
