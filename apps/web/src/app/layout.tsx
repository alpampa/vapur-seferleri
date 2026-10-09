import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { NotificationContainer } from "@/components/ui/NotificationToast";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ReducedMotionProvider } from "@/components/providers/ReducedMotionProvider";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vapur Seferleri — İstanbul Canlı Deniz Ulaşımı",
  description: "İstanbul Şehir Hatları, Mavi Marmara ve Prens Tur canlı vapur kalkış panosu, durak takibi ve deniz hava durumu asistanı.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0a0f1d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('vapur_app_theme_v1');
                if (stored) {
                  var parsed = JSON.parse(stored);
                  if (parsed && parsed.state && parsed.state.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (parsed && parsed.state && parsed.state.theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-100 dark:bg-[#070b14] text-slate-900 dark:text-white min-h-[100dvh] touch-pan-y pb-[env(safe-area-inset-bottom)] transition-colors duration-150">
        <ReducedMotionProvider>
          <ServiceWorkerRegister />
          {children}
          <NotificationContainer />
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
