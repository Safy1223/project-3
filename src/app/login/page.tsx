// app/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PenSquare } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, startSubmitting] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    startSubmitting(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Login successful!");
        router.push("/dashboard/posts");
        router.refresh();
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
            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-2">
              Sign in to access your creative space.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
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
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* --- القسم الأيسر: الصورة (يختفي على الموبايل) --- */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center">
        {/* الصورة الخلفية */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        ></div>
        {/* تراكب لوني لجعل النص أوضح */}
        <div className="absolute inset-0 bg-blue-800 opacity-70"></div>

        {/* المحتوى فوق الصورة */}
        <div className="relative z-10 text-white text-center p-12 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight">
            Unlock Your Creativity.
          </h2>
          <p className="mt-4 text-lg text-blue-200">
            Join our community of writers and creators. Share your stories with
            the world.
          </p>
        </div>
      </div>
    </div>
  );
}
