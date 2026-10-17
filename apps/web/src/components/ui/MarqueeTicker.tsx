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
}: MarqueeTickerProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [flowing, setFlowing] = useState(false);
  const [durationSec, setDurationSec] = useState(60);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!outer || !track) return;

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children, speedPxPerSec]);

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
                "linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent)",
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
