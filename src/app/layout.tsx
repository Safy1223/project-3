import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers"; // <--- أضف هذا السطر لاستيراد مكون Providers الجديد
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar /> {/* <--- إضافة شريط التنقل هنا */}
          <main className="min-h-screen">
            {" "}
            {/* يمكنك إضافة تنسيقات للمحتوى الرئيسي */}
            {children}
            <Toaster position="bottom-center" /> {/* <--- 2. أضف المكون هنا */}
          </main>
        </Providers>
      </body>
    </html>
  );
}
