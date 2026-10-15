import { describe, it, expect } from "vitest";
import {
  DARK_THEME_IDS,
  DEFAULT_THEME_ID,
  THEME_STORAGE_KEY,
} from "@/lib/theme-ids";
import { THEME_PRESETS } from "@/store/useThemeStore";

/**
 * REGRESYON TESTİ: layout.tsx'teki FOUC script'i ve store aynı bilgiyi
 * iki ayrı yerde tutuyor. Bu test ikisinin ayrışmasını engeller.
 */
describe("tema kimlikleri tutarlılığı", () => {
  it("DARK_THEME_IDS, isDark=true olan presetlerle birebir aynı", () => {
    const fromPresets = THEME_PRESETS.filter((p) => p.isDark).map((p) => p.id);
    expect([...DARK_THEME_IDS].sort()).toEqual(fromPresets.sort());
  });

  it("hiçbir karanlık preset listelenmemiş kalmaz (ve tersi)", () => {
    const presetDark = new Set(
      THEME_PRESETS.filter((p) => p.isDark).map((p) => p.id as string),
    );
    for (const id of DARK_THEME_IDS) {
      expect(presetDark.has(id)).toBe(true);
    }
    expect(DARK_THEME_IDS.length).toBe(presetDark.size);
  });

  it("varsayılan tema gerçek bir preset", () => {
    expect(THEME_PRESETS.some((p) => p.id === DEFAULT_THEME_ID)).toBe(true);
  });

  it("depolama anahtarı v2 (v1'e geri dönüş regresyonunu engeller)", () => {
    expect(THEME_STORAGE_KEY).toBe("vapur_app_theme_v2");
  });
});
