// components/Navbar.tsx
"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import SearchInput from "./SearchInput";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    // --- تعديل: تصميم بسيط بخلفية بيضاء وحدود ---
    <header className="border-b bg-white">
      <div className="container mx-auto flex items-center justify-between p-4 flex-wrap">
        {/* --- الجزء الأيسر: الشعار والروابط --- */}
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            MyBlog
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </nav>
        </div>

        {/* --- الجزء الأيمن: البحث والمصادقة --- */}
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex-grow">
            <SearchInput />
          </div>

          {/* --- تعديل: منطق عرض حالة المصادقة --- */}
          {status === "loading" ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : status === "authenticated" ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 hidden lg:inline">
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
            <div className="flex items-center space-x-2">
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
