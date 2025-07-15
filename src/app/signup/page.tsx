"use client";
import { InputWithIcon } from "@/components/IconWithInput";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registration successful! Please log in.");
        router.push("/login");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      // هذا الكود يُنفّذ دائماً
    }
  }
  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div className="relative flex-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white p-4 flex-col flex items-center justify-center">
        <img
          src="/icon/Group.svg"
          alt="Background shape"
          className="absolute bottom-0 left-0   z-0 border-none"
        />

        <h2 className=" text-3xl  font-bold mb-4 mt-7">GoFinance</h2>
        <p className="mb-6">The most popular peer to peer lending at SEA</p>
        <Link href="/login">
          <Button
            className="bg-[#5CA9F8] rounded-md hover:bg-white/20 transition cursor-pointer "
            variant="outline"
          >
            Login
          </Button>
        </Link>
      </div>
      {/* Right Side */}
      <div className="bg-[#EEEEEE] flex-1/3 flex justify-center items-center flex-col  ">
        <h1 className="text-2xl font-bold">Hello Again!</h1>
        <p className="mt-6">Welcome Back</p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full max-w-xs"
        >
          <InputWithIcon
            icon={User}
            placeholder="Full Name"
            type="Text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputWithIcon
            icon={Mail}
            placeholder="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputWithIcon
            icon={Lock}
            placeholder="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className="bg-[#5CA9F8] rounded-md hover:bg-white/20 transition cursor-pointer  w-1/3"
            variant="outline"
            disabled={loading || !username || !email || !password} // تعطيل الزر
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
