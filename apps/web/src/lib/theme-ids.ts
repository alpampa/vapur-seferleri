/**
 * Tema kimlikleri ve depolama anahtarı — sunucu tarafında da güvenli düz veri.
 *
 * NEDEN AYRI DOSYA: `layout.tsx` içindeki FOUC (açılışta renk sıçraması)
 * engelleyici inline script bu değerlere ihtiyaç duyar. `useThemeStore` ise
 * "use client" işaretlidir ve bir Server Component'ten import edildiğinde
 * gerçek değer değil client reference döner. Bu yüzden veri burada tutulur;
 * `THEME_PRESETS` ile tutarlılığı testle garanti edilir:
 * bkz. src/lib/__tests__/theme-ids.test.ts
 */

/** zustand-persist anahtarı — store ve FOUC script aynı anahtarı kullanmalı. */
export const THEME_STORAGE_KEY = "vapur_app_theme_v2";

/** İlk açılışta uygulanan preset (store varsayılanı). */
export const DEFAULT_THEME_ID = "deep-navy" as const;

/** `isDark: true` olan presetlerin id'leri (koyu tema → `dark` sınıfı). */
export const DARK_THEME_IDS = [
  "deep-navy",
  "cyber-radar",
  "golden-hour",
] as const;
