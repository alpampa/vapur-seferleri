"use client";

import { MotionConfig } from "framer-motion";

/**
 * Cihazda "hareketi azalt" tercihi etkinse framer-motion animasyonlarını
 * (transform/layout) devre dışı bırakır. WCAG 2.3.3.
 * CSS animasyonları globals.css içindeki prefers-reduced-motion bloğu ile kapatılır.
 */
export function ReducedMotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
