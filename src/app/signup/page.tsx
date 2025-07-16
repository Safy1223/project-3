// app/signup/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Lock, PenSquare } from "lucide-react";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, startSubmitting] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      toast.error("All fields are required.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    startSubmitting(async () => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Registration failed.");
        }

        toast.success("Registration successful! Please sign in.");
        router.push("/login");
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* --- القسم الأيمن: النموذج --- */}
      <div className="flex flex-1 flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <PenSquare className="h-10 w-10 text-blue-600" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Create an Account
            </h1>
            <p className="text-gray-500 mt-2">
              Start your writing journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="John Doe"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full !mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* --- القسم الأيسر: الصورة (يختفي على الموبايل) --- */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.jpg')" }} // استخدام نفس الصورة
        ></div>
        <div className="absolute inset-0 bg-blue-800 opacity-70"></div>
        <div className="relative z-10 text-white text-center p-12 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight">
            Share Your Voice.
          </h2>
          <p className="mt-4 text-lg text-blue-200">
            Become part of a growing community of writers and thinkers. Your
            story is waiting to be told.
          </p>
        </div>
      </div>
    </div>
  );
}
