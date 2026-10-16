"use client";

import { usePreferencesStore } from "@/store/usePreferencesStore";
import { useLanguageStore } from "@/store/useLanguageStore";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

interface AdSlotProps {
  slotId: string;
  className?: string;
}

/**
 * Env kapılı reklam alanı: NEXT_PUBLIC_ADSENSE_CLIENT tanımlı değilse
 * hiçbir şey render etmez. Vapur Pro (proUnlocked) açıkken de reklam gösterilmez.
 */
export function AdSlot({ slotId, className }: AdSlotProps) {
  const { proUnlocked } = usePreferencesStore();
  const { t } = useLanguageStore();

  if (!ADSENSE_CLIENT || proUnlocked) return null;

  return (
    <div
      className={className}
      role="complementary"
      aria-label={t("sponsored")}
      data-ad-slot-id={slotId}
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
