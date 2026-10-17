/**
 * Ada Vapuru ikonu — yandan görünüm, pruva sağa (seyir yönü sağa doğru).
 * Klasik İstanbul ada vapuru esintili: beyaz gövde, lacivert su hattı,
 * sarı baca. Canlı efektler (globals.css): hafif yalpalama (bob),
 * bacadan duman, su hattında iz (wake). prefers-reduced-motion'da durur.
 */
export function AdaVapuruIcon({ className = "w-7 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 24"
      className={className}
      role="img"
      aria-label="Ada vapuru"
      fill="none"
    >
      {/* Su hattı izleri (gemi sağa giderken iz geriye akar) */}
      <g stroke="#38bdf8" strokeWidth="0.9" strokeLinecap="round">
        <line className="ferry-wake" x1="26" y1="22.4" x2="32" y2="22.4" />
        <line className="ferry-wake ferry-wake-2" x1="14" y1="22.9" x2="19" y2="22.9" />
      </g>

      <g className="ferry-bob">
        {/* Bacadan çıkan duman */}
        <circle className="ferry-smoke" cx="23.4" cy="2.6" r="1.7" fill="#cbd5e1" />
        <circle className="ferry-smoke ferry-smoke-2" cx="23" cy="2.2" r="1.1" fill="#e2e8f0" />

        {/* Baca: sarı gövde + siyah şapka bandı */}
        <rect x="21.4" y="4" width="4.2" height="5.2" rx="0.7" fill="#f59e0b" stroke="#d97706" strokeWidth="0.4" />
        <rect x="21.4" y="4" width="4.2" height="1.3" rx="0.6" fill="#0f172a" />

        {/* Ön direk */}
        <line x1="9.2" y1="4.4" x2="9.2" y2="9.4" stroke="#94a3b8" strokeWidth="0.8" />

        {/* Yolcu kabini + pencereler */}
        <path d="M6.4 9.6h24v3.6h-24z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <g fill="#3b82f6">
          <rect x="7.6" y="10.6" width="2.1" height="1.6" rx="0.3" />
          <rect x="11" y="10.6" width="2.1" height="1.6" rx="0.3" />
          <rect x="14.4" y="10.6" width="2.1" height="1.6" rx="0.3" />
          <rect x="17.8" y="10.6" width="2.1" height="1.6" rx="0.3" />
          <rect x="21.2" y="10.6" width="2.1" height="1.6" rx="0.3" />
          <rect x="24.6" y="10.6" width="2.1" height="1.6" rx="0.3" />
        </g>

        {/* Gövde (pruva sağa doğru incelir) */}
        <path
          d="M4.2 13.2h31.6l-3 4c-.5.7-1.3 1.1-2.2 1.1H7.2c-1 0-1.9-.5-2.3-1.3z"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="0.6"
        />
        {/* Lacivert su hattı bandı */}
        <path
          d="M4.9 15.5h30.1l-1.2 1.7c-.5.7-1.3 1.1-2.2 1.1H7.5c-.9 0-1.8-.5-2.2-1.2z"
          fill="#1e3a8a"
        />
      </g>
    </svg>
  );
}
