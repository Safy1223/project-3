// components/Providers.tsx
"use client"; // <--- هذا السطر ضروري جداً هنا

import { SessionProvider } from "next-auth/react";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
