"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/useLanguageStore";
import { usePreferencesStore } from "@/store/usePreferencesStore";

/**
 * Tercihleri belge köküne uygular: dil (lang + RTL yönü) ve yazı boyutu.
 * Görsel çıktı üretmez; yalnızca <html> öznitelikleri ve kök punto ölçeği.
 */
export function PreferenceEffects() {
  const language = useLanguageStore((s) => s.language);
  const fontScale = usePreferencesStore((s) => s.fontScale);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = language;
    el.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("text-scale-lg", fontScale === "large");
  }, [fontScale]);

  return null;
}
