// components/Navbar.tsx
"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-sky-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          My Blog
        </Link>

        <div className="space-x-4">
          <Link href="/">
            <Button variant="ghost" className="text-white">
              Home
            </Button>
          </Link>

          {status === "loading" ? (
            <span className="text-gray-400">Loading...</span>
          ) : status === "authenticated" ? (
            <>
              <Link href="/dashboard/posts">
                <Button variant="ghost" className="text-white">
                  Dashboard
                </Button>
              </Link>
              <span className="text-gray-300">
                Hello, {session.user?.name || session.user?.email}!
              </span>
              <Button
                variant="destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="ghost" className="text-white">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
