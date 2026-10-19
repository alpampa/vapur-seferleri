/**
 * OpenSeaMap "seamark" (deniz feneri/şamandıra) döşeme katmanı için dayanıklı yardımcı.
 *
 * Üst kaynak (tiles.openseamap.org) zaman zaman 503 dönebiliyor (bağımsız denetimde
 * gözlemlendi). Katmanı körlemesine eklemek yerine önce tek bir örnek döşemeyi
 * yoklarız: erişilemezse katmanı HİÇ eklemeyiz (tekrarlayan başarısız istek ve
 * konsol gürültüsü olmaz) ve çağırana dürüst bir "kullanılamıyor" bildirimi veririz.
 * erişilebilirse normal ekler; yine de yüklemeler hataya dönerse katmanı kaldırır.
 */

const SEAMARK_TILE_URL = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";

// Döşeme bulunamazsa Leaflet'in kırık görsel yerine boş kare göstermesi için 1x1 şeffaf GIF
const TRANSPARENT_TILE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Yoklama için bilinen geçerli bir döşeme (İstanbul çevresi, z10). */
const PROBE_TILE_URL = "https://tiles.openseamap.org/seamark/10/512/336.png";

function probeSeamarkTile(timeoutMs = 4000): Promise<boolean> {
  if (typeof window === "undefined" || typeof Image === "undefined") return Promise.resolve(false);

  return new Promise<boolean>((resolve) => {
    const img = new Image();
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    const timer = setTimeout(() => done(false), timeoutMs);
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.src = PROBE_TILE_URL;
  });
}

export interface SeamarkLayerOptions {
  opacity?: number;
  maxZoom?: number;
  /** Katman kullanılamadığında (erişilemez veya tekrarlı yükleme hatası) çağrılır. */
  onUnavailable?: () => void;
}

/**
 * OpenSeaMap katmanını güvenli şekilde ekler. Erişilemezse `null` döner ve
 * `onUnavailable` tetiklenir. Başarıyla eklenirse Leaflet layer nesnesi döner.
 */
export async function addSeamarkLayerWithFallback(
  L: typeof import("leaflet"),
  map: import("leaflet").Map,
  options: SeamarkLayerOptions = {}
): Promise<import("leaflet").TileLayer | null> {
  const reachable = await probeSeamarkTile();
  if (!reachable) {
    options.onUnavailable?.();
    return null;
  }

  const layer = L.tileLayer(SEAMARK_TILE_URL, {
    maxZoom: options.maxZoom ?? 17,
    opacity: options.opacity ?? 0.65,
    errorTileUrl: TRANSPARENT_TILE,
    attribution: "",
  });

  let errors = 0;
  layer.on("tileerror", () => {
    errors += 1;
    if (errors >= 3) {
      try {
        map.removeLayer(layer);
      } catch {
        /* harita zaten yoksa yoksay */
      }
      options.onUnavailable?.();
    }
  });

  layer.addTo(map);
  return layer;
}
