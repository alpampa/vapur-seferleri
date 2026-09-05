import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationContainer } from "@/components/ui/NotificationToast";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vapur Seferleri — İstanbul Canlı Deniz Ulaşımı",
  description: "İstanbul Şehir Hatları, Mavi Marmara ve Prens Tur canlı vapur kalkış panosu, durak takibi ve deniz hava durumu asistanı.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0a0f1d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#070b14] text-white min-h-screen pb-[env(safe-area-inset-bottom)]`}>
        <ServiceWorkerRegister />
        {children}
        <NotificationContainer />
      </body>
    </html>
  );
}
