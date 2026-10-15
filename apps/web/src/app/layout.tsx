import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { NotificationContainer } from "@/components/ui/NotificationToast";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ReducedMotionProvider } from "@/components/providers/ReducedMotionProvider";
import { DARK_THEME_IDS, DEFAULT_THEME_ID, THEME_STORAGE_KEY } from "@/lib/theme-ids";

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
                var key = ${JSON.stringify(THEME_STORAGE_KEY)};
                var darkIds = ${JSON.stringify(DARK_THEME_IDS)};
                var themeId = ${JSON.stringify(DEFAULT_THEME_ID)};
                var raw = localStorage.getItem(key);
                if (raw) {
                  var parsed = JSON.parse(raw);
                  if (parsed && parsed.state && parsed.state.theme) {
                    themeId = parsed.state.theme;
                  }
                }
                var root = document.documentElement;
                root.setAttribute('data-theme', themeId);
                if (darkIds.indexOf(themeId) !== -1) {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
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
