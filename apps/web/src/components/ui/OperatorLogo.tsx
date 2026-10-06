"use client";

import React from "react";
import { resolveOperatorLogoPath, getOperatorRecord } from "@/lib/data/operator-registry";

export type FerryOperator =
  | "Şehir Hatları"
  | "İDO"
  | "Turyol"
  | "Mavi Marmara"
  | "Dentur Avrasya"
  | "Dentur"
  | "Prens Tur";

interface OperatorLogoProps {
  operator: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const SIZE_H = { sm: 18, md: 26, lg: 34 };
const TEXT_SIZE = { sm: "text-[11px]", md: "text-xs", lg: "text-sm" };

/**
 * Resmi (orijinal) firma logoları. Kaynaklar:
 * - Şehir Hatları : sehirhatlari.istanbul → /logos/operator-sehirhatlari.png
 * - Mavi Marmara   : mavimarmara.net      → /logos/operator-mavimarmara.png
 * - Dentur Avrasya : denturavrasya.com    → /logos/operator-dentur.png
 * - Prens Tur      : prenstur.net         → /logos/operator-prenstur.png
 * - Turyol         : turyol.com           → /logos/operator-turyol.png
 *
 * Logo registry'de tanımlı değilse nötr bir yedek rozet gösterilir (uydurma yok).
 */
export function OperatorLogo({ operator, size = "sm", showName = true, className = "" }: OperatorLogoProps) {
  const logoPath = resolveOperatorLogoPath(operator);
  const record = getOperatorRecord(operator);
  const h = SIZE_H[size];
  const textSize = TEXT_SIZE[size];
  const displayName = record?.shortName ?? operator;

  if (logoPath) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 min-w-0 shrink-0 ${className}`}
        title={operator}
      >
        <img
          src={logoPath}
          alt={`${operator} logosu`}
          width={h * 2}
          height={h}
          style={{ height: h, width: "auto", maxWidth: size === "lg" ? 110 : 88 }}
          className="object-contain shrink-0"
          loading="lazy"
        />
        {showName && (
          <span className={`font-bold tracking-tight text-slate-700 dark:text-slate-200 truncate ${textSize}`}>
            {displayName}
          </span>
        )}
      </span>
    );
  }

  // Fallback: registry'de logodar yoksa nötr rozet (renk anlam taşımaz)
  return (
    <span className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 min-w-0 shrink-0 ${className}`}>
      <span
        className="rounded bg-slate-700 dark:bg-slate-600 flex items-center justify-center shrink-0"
        style={{ height: h, width: h }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a2.5 2.5 0 0 0-2.5 2.5c0 .7.3 1.3.8 1.8V8h-2v2h2v7.1A7.01 7.01 0 0 1 4 11H2a9.01 9.01 0 0 0 9 9 9.01 9.01 0 0 0 9-9h-2a7.01 7.01 0 0 1-6.3 6.1V10h2V8h-2V6.3c.5-.5.8-1.1.8-1.8A2.5 2.5 0 0 0 12 2z"/>
        </svg>
      </span>
      {showName && (
        <span className={`font-bold tracking-tight text-slate-600 dark:text-slate-300 truncate ${textSize}`}>
          {displayName}
        </span>
      )}
    </span>
  );
}
