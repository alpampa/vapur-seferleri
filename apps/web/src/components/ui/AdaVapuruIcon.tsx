/**
 * Ada Vapuru ikonu — yandan görünüm, pruva sağa (seyir yönü sağa).
 * Klasik İstanbul ada vapuru profili: beyaz gövde, sarı sancak şeridi,
 * lacivert su hattı, sarı-siyah baca, önde köprüüstü, pruvada direk + bayrak.
 * Canlı efektler (globals.css): yalpalama, baca dumanı, dalgalar ve martılar.
 * prefers-reduced-motion'da tüm animasyonlar durur.
 *
 * viewBox üst payı (-4): dumanın yükselip kaybolması için nefes alanı.
 */
export function AdaVapuruIcon({ className = "w-7 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -4 48 28"
      className={className}
      role="img"
      aria-label="Ada vapuru"
      fill="none"
    >
      {/* MARTILAR — gemi çevresinde süzülen üç martı (konum grup transformunda,
          animasyon path üzerinde: CSS transform SVG transform attribute'unu ezer) */}
      <g stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round">
        <g transform="translate(5.5 4.4)">
          <path className="ferry-gull" d="M-2.2,0.6 Q-1.1,-0.8 0,0.1 Q1.1,-0.8 2.2,0.6" />
        </g>
        <g transform="translate(15 2.6)">
          <path className="ferry-gull ferry-gull-2" d="M-1.8,0.5 Q-0.9,-0.7 0,0.1 Q0.9,-0.7 1.8,0.5" />
        </g>
        <g transform="translate(43.5 8.6)">
          <path className="ferry-gull ferry-gull-3" d="M-2,0.55 Q-1,-0.75 0,0.1 Q1,-0.75 2,0.55" />
        </g>
      </g>

      {/* DALGALAR — iki katmanlı, dikişsiz akış (4 birim periyot) */}
      <path
        className="ferry-wave"
        d="M1,20.9 q2,-1.1 4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0"
        stroke="#7dd3fc"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        className="ferry-wave ferry-wave-2"
        d="M-3,22.5 q2,-1.1 4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0 t4,0"
        stroke="#38bdf8"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Pruva köpüğü */}
      <g stroke="#bae6fd" strokeWidth="0.7" strokeLinecap="round" opacity="0.9">
        <path d="M39.5,20.1 q1.5,-2.2 3.6,-1" />
        <path d="M41.6,19.7 q1.1,-1.5 2.6,-0.7" />
      </g>

      <g className="ferry-bob">
        {/* BACADAN DUMAN — üç kademeli puff */}
        <circle className="ferry-smoke" cx="21.8" cy="0.9" r="1.7" fill="#cbd5e1" />
        <circle className="ferry-smoke ferry-smoke-2" cx="22.4" cy="1" r="1.2" fill="#e2e8f0" />
        <circle className="ferry-smoke ferry-smoke-3" cx="21.2" cy="1.2" r="0.85" fill="#f1f5f9" />

        {/* BACA — sarı gövde, siyah şapka + ince kuşak */}
        <rect x="19.6" y="1.6" width="4.4" height="5" rx="0.6" fill="#f59e0b" stroke="#d97706" strokeWidth="0.4" />
        <rect x="19.6" y="1.6" width="4.4" height="1.3" rx="0.5" fill="#0f172a" />
        <rect x="19.6" y="4.7" width="4.4" height="0.5" fill="#0f172a" opacity="0.85" />

        {/* PRUVA DİREĞİ + kırmızı bayrak */}
        <line x1="39.8" y1="3.8" x2="39.8" y2="14.6" stroke="#94a3b8" strokeWidth="0.7" />
        <path d="M39.8,4 L43.4,5.05 L39.8,6.1 Z" fill="#ef4444" />

        {/* ÜST GÜVERTE + pencereler */}
        <rect x="12" y="6.6" width="21" height="3.6" rx="0.4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <g fill="#3b82f6" opacity="0.9">
          <rect x="13.4" y="7.7" width="1.8" height="1.5" rx="0.25" />
          <rect x="16.3" y="7.7" width="1.8" height="1.5" rx="0.25" />
          <rect x="19.2" y="7.7" width="1.8" height="1.5" rx="0.25" />
          <rect x="22.1" y="7.7" width="1.8" height="1.5" rx="0.25" />
          <rect x="25" y="7.7" width="1.8" height="1.5" rx="0.25" />
          <rect x="27.9" y="7.7" width="1.8" height="1.5" rx="0.25" />
        </g>

        {/* KÖPRÜÜSTÜ — önde yükseltilmiş kaptan köşkü */}
        <rect x="29.6" y="4.6" width="5" height="3.6" rx="0.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <g fill="#3b82f6">
          <rect x="30.5" y="5.6" width="1.5" height="1.4" rx="0.2" />
          <rect x="32.4" y="5.6" width="1.5" height="1.4" rx="0.2" />
        </g>

        {/* ANA KAMARA + alt sıra pencereler */}
        <rect x="8" y="10.2" width="30" height="4.8" rx="0.4" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <g fill="#3b82f6">
          <rect x="9.6" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="12.4" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="15.2" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="18" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="20.8" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="23.6" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="26.4" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="29.2" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="32" y="11.5" width="1.9" height="1.8" rx="0.3" />
          <rect x="34.8" y="11.5" width="1.9" height="1.8" rx="0.3" />
        </g>

        {/* GÖVDE — pruvada öne devrilen kaş; sarı sancak şeridi + lacivert su hattı */}
        <path
          d="M3,15 L40.6,15 L43,19.7 Q42.4,20.7 41,20.7 L6,20.7 Q4,20.7 3.5,19.4 Z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="0.5"
        />
        <rect x="3.2" y="15.5" width="37.4" height="1" rx="0.3" fill="#fbbf24" />
        <path
          d="M4,18.4 L42.3,18.4 L43,19.7 Q42.4,20.7 41,20.7 L6,20.7 Q4,20.7 3.5,19.4 Z"
          fill="#1e3a8a"
        />
      </g>
    </svg>
  );
}
