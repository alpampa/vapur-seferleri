import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FerryFlow - Live Ferry Tracking",
  description: "Real-time ferry schedules, tracking, and ticketing",
};

export const viewport = {
  themeColor: "#041225", // Deep Navy
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[var(--deep-navy)] text-[var(--text-primary)] min-h-screen pb-[env(safe-area-inset-bottom)]`}>
        {children}
      </body>
    </html>
  );
}
