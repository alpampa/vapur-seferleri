"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface MarqueeTickerProps {
  children: ReactNode;
  /** Akış hızı (px/sn) — süre, içerik genişliğinden hesaplanır */
  speedPxPerSec?: number;
  className?: string;
  ariaLabel?: string;
  /**
   * KULLANICI KURALI (dönerli sistem): Kayan içerik BİR TAM TUR attığında
   * çağrılır; akış yoksa (içerik sığıyor / hareket azaltma) fallbackCycleMs
   * sonunda çağrılır. Geri çağrı her turda yeniden kurulur; üst üste
   * çağrılar sıradaki öğeye geçişi tetikler.
   */
  onCycleEnd?: () => void;
  /** Akış olmadığında tur yerine geçen okuma süresi (ms) */
  fallbackCycleMs?: number;
  /**
   * Ölçüm/tur yeniden kurulumunu tetikleyen İÇERİK anahtarı. Üst bant gibi
   * sık yeniden render edilen yerlerde verilmezse her render tur sayacını
   * sıfırlar; verilirse tur yalnızca öğe değişince yeniden başlar.
   */
  cycleKey?: string | number;
}

/**
 * KULLANICI KURALI: İptal seferler ve kritik duyurular TEK SATIRDA akmalıdır.
 *
 * İçerik kapsayıcıya sığmıyorsa kesintisiz döngüyle soldan sağa akar
 * (iki kopya + translateX(-50%), dikişsiz). Sığıyorsa veya kullanıcı
 * "hareketi azalt" tercihindeyse sabit kalır ve elle kaydırılabilir —
 * duyuru bu durumda bile asla gizlenmez.
 */
export function MarqueeTicker({
  children,
  speedPxPerSec = 50,
  className = "",
  ariaLabel,
  onCycleEnd,
  fallbackCycleMs = 9000,
  cycleKey,
}: MarqueeTickerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [flowing, setFlowing] = useState(false);
  const [durationSec, setDurationSec] = useState(60);
  // Tur sonu geri çağrısı her render'da tazelenir (bayat closure yok)
  const onCycleEndRef = useRef<(() => void) | undefined>(onCycleEnd);
  onCycleEndRef.current = onCycleEnd;
  // cycleKey verilmişse ölçüm yalnızca içerik değişince yeniden yapılır
  const effectiveKey = cycleKey ?? children;

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cycleTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    /** Tur döngüsü: tam tur (akış) veya okuma süresi (sabit) sonunda bildirir
     *  ve bir sonraki turu kurar — üst bantta dönerli firma geçişi sağlar. */
    const scheduleCycle = (shouldFlow: boolean, durSec: number) => {
      if (cancelled || !onCycleEndRef.current) return;
      const ms = shouldFlow ? durSec * 1000 + 350 : fallbackCycleMs;
      cycleTimer = setTimeout(() => {
        if (cancelled) return;
        onCycleEndRef.current?.();
        scheduleCycle(shouldFlow, durSec);
      }, ms);
    };

    const measure = () => {
      const singleCopyWidth = track.scrollWidth / 2;
      const shouldFlow =
        !prefersReduced && singleCopyWidth > outer.clientWidth + 1;
      setFlowing(shouldFlow);
      if (shouldFlow) {
        setDurationSec(
          Math.max(22, Math.round(singleCopyWidth / speedPxPerSec))
        );
      }
      if (cycleTimer) clearTimeout(cycleTimer);
      const durSec = shouldFlow
        ? Math.max(22, Math.round(singleCopyWidth / speedPxPerSec))
        : 0;
      scheduleCycle(shouldFlow, durSec);
    };

    measure();
    const raf = requestAnimationFrame(measure);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(outer);
    }
    window.addEventListener("resize", measure);

    return () => {
      cancelled = true;
      if (cycleTimer) clearTimeout(cycleTimer);
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [effectiveKey, speedPxPerSec, fallbackCycleMs]);

  return (
    <div
      ref={outerRef}
      role={ariaLabel ? "region" : undefined}
      aria-label={ariaLabel}
      className={`min-w-0 flex-1 overflow-hidden ${
        flowing ? "" : "overflow-x-auto hide-scrollbar"
      } ${className}`}
      style={
        flowing
          ? {
              maskImage:
                "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
            }
          : undefined
      }
    >
      <div
        ref={trackRef}
        className={`flex w-max items-center ${flowing ? "animate-marquee" : ""}`}
        style={
          flowing
            ? ({ "--marquee-duration": `${durationSec}s` } as CSSProperties)
            : undefined
        }
      >
        <div className="flex shrink-0 items-center gap-4 pr-4 whitespace-nowrap">
          {children}
        </div>
        <div
          className="flex shrink-0 items-center gap-4 pr-4 whitespace-nowrap"
          aria-hidden="true"
          inert
        >
          {children}
        </div>
      </div>
    </div>
  );
}
