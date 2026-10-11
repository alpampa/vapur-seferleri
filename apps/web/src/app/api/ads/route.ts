import { NextRequest, NextResponse } from "next/server";
import {
  getSponsoredAdsStore,
  recordAdInteraction,
  toggleSponsoredAdActive,
  updateSponsoredAd,
  createSponsoredAd,
  getTariffWatchdogStatus,
} from "@/lib/data/sponsored-ads";

export const dynamic = "force-dynamic";

function isAdminAuthorized(req: NextRequest): boolean {
  const expectedKey = process.env.ADMIN_SECRET || "ZKIO-2026";
  const headerKey = req.headers.get("x-admin-key");
  return Boolean(headerKey && headerKey === expectedKey);
}

export async function GET(req: NextRequest) {
  const allAds = getSponsoredAdsStore();
  const isAdmin = isAdminAuthorized(req);

  if (isAdmin) {
    const activeAds = allAds.filter((a) => a.active);
    const totalMonthlyFixedTry = activeAds.reduce((sum, a) => sum + (a.monthlyFeeTry || 0), 0);
    const totalImpressions = allAds.reduce((sum, a) => sum + a.impressions, 0);
    const totalClicks = allAds.reduce((sum, a) => sum + a.clicks, 0);
    const totalWhatsappLeads = allAds.reduce((sum, a) => sum + a.whatsappLeads, 0);
    const averageCtrPercent =
      totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(1)) : 0;

    return NextResponse.json({
      ads: allAds,
      summary: {
        activeSponsorCount: activeAds.length,
        totalSponsorCount: allAds.length,
        totalMonthlyFixedTry,
        totalImpressions,
        totalClicks,
        totalWhatsappLeads,
        averageCtrPercent,
      },
      tariffWatchdog: getTariffWatchdogStatus(),
    });
  }

  return NextResponse.json({
    ads: allAds.filter((a) => a.active),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action || "");
    const adId = String(body?.adId || "");

    // Son kullanıcı tıklama / WhatsApp rezervasyon yönlendirme sayacı
    if (action === "IMPRESSION" || action === "CLICK" || action === "WHATSAPP_LEAD") {
      if (!adId) {
        return NextResponse.json({ error: "adId gerekli" }, { status: 400 });
      }
      const updated = recordAdInteraction(adId, action);
      return NextResponse.json({ ok: true, ad: updated });
    }

    // Yönetici işlemleri (PIN / ADMIN_SECRET korumalı)
    if (!isAdminAuthorized(req)) {
      return NextResponse.json({ error: "Yetkisiz yönetici erişimi" }, { status: 401 });
    }

    if (action === "TOGGLE_ACTIVE") {
      const updated = toggleSponsoredAdActive(adId);
      return NextResponse.json({ ok: true, ad: updated, ads: getSponsoredAdsStore() });
    }

    if (action === "UPDATE_AD") {
      const patch = body?.patch || {};
      const updated = updateSponsoredAd(adId, patch);
      return NextResponse.json({ ok: true, ad: updated, ads: getSponsoredAdsStore() });
    }

    if (action === "CREATE_AD") {
      const p = body?.payload || {};
      if (!p.sponsorName || !p.headline || !p.targetUrl) {
        return NextResponse.json({ error: "Sponsor adı, başlık ve hedef link zorunludur." }, { status: 400 });
      }
      const created = createSponsoredAd({
        sponsorName: String(p.sponsorName).slice(0, 80),
        category: p.category || "HOTEL",
        badgeLabel: String(p.badgeLabel || "ADA SPONSORU").slice(0, 30),
        iconEmoji: String(p.iconEmoji || "🏨").slice(0, 4),
        headline: String(p.headline).slice(0, 120),
        offerText: String(p.offerText || "Vapur yolcularına özel fırsat.").slice(0, 160),
        couponCode: String(p.couponCode || "VAPUR15").slice(0, 20).toUpperCase(),
        priceHighlight: String(p.priceHighlight || "%15 İndirim").slice(0, 25),
        ctaLabel: String(p.ctaLabel || "İncele & Rezervasyon").slice(0, 35),
        targetUrl: String(p.targetUrl).slice(0, 500),
        whatsappPhone: p.whatsappPhone ? String(p.whatsappPhone).replace(/\D/g, "").slice(0, 15) : undefined,
        whatsappPrefillText: p.whatsappPrefillText ? String(p.whatsappPrefillText).slice(0, 250) : undefined,
        targetPiers: Array.isArray(p.targetPiers) && p.targetPiers.length > 0 ? p.targetPiers : ["Büyükada", "Heybeliada"],
        routeCategory: p.routeCategory || "ADALAR",
        billingModel: p.billingModel || "MONTHLY_FIXED",
        monthlyFeeTry: Number(p.monthlyFeeTry) || 10000,
        commissionRateText: String(p.commissionRateText || "Aylık Sabit Sponsorluk").slice(0, 100),
        active: true,
      });
      return NextResponse.json({ ok: true, ad: created, ads: getSponsoredAdsStore() });
    }

    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "İstek işlenemedi" }, { status: 500 });
  }
}
