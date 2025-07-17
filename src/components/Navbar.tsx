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
      <div className="   flex items-center justify-between p-4 flex-wrap  ">
        {/* --- الجزء الأيسر: الشعار والروابط --- */}
        <div className="flex flex-1 xl:flex-none space-x-6 mb-4 md:mb-0 ">
          <Link href="/" className=" text-2xl font-bold text-gray-900">
            MyBlog
          </Link>
          <nav className="flex flex-1/2 justify-end  sm:flex items-center space-x-4">
            <Link href="/" className=" text-gray-600 hover:text-gray-900">
              Home
            </Link>
            {status === "authenticated" && session.user.role !== "admin" ? (
              <Link
                href="/dashboard/categories"
                className=" text-gray-600 hover:text-gray-900"
              >
                Categories
              </Link>
            ) : (
              false
            )}
          </nav>
        </div>

        {/* --- الجزء الأيمن: البحث والمصادقة --- */}
        <div className=" sm:flex items-center space-x-4 w-full md:mt-1">
          <div className="flex-grow flex justify-center md:justify-between xl:flex-none">
            <SearchInput />
          </div>

          {/* --- تعديل: منطق عرض حالة المصادقة --- */}
          {status === "loading" ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : status === "authenticated" ? (
            <div className="mt-2 flex md:flex items-center space-x-3">
              <span className="flex-2 text-sm text-gray-700">
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
