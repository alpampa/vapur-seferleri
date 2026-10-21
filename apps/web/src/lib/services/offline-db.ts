/**
 * VAPUR NATIVE INDEXEDDB OFFLINE STORAGE ENGINE
 * 
 * Swiss Transit Architecture standardı:
 * - Asenkron, ana iş parçacığını (main-thread) bloke etmeyen non-blocking I/O.
 * - localStorage 5MB kotasını aşan geniş tarife yükleri için limitsiz IndexedDB tabanı.
 * - Incognito veya sandbox kısıtlamalarında sessiz localStorage geri dönüşü (graceful degradation).
 */

import type { ScheduleCardDto } from "@/lib/types/schedule";

const DB_NAME = "vapur_transit_offline_db";
const DB_VERSION = 1;
const SCHEDULES_STORE = "schedules_store";
const META_STORE = "meta_store";

// Bellek içi acil durum fallback deposu
let memoryFallbackCache: ScheduleCardDto[] | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment."));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(SCHEDULES_STORE)) {
          db.createObjectStore(SCHEDULES_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE, { keyPath: "key" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("IndexedDB blocked by other tabs."));
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Resmi sefer tarifesini asenkron olarak IndexedDB'ye yazar.
 * UI iş parçacığında donma (jank) yaratmaz.
 */
export async function saveSchedulesOffline(schedules: ScheduleCardDto[]): Promise<void> {
  if (!schedules || schedules.length === 0) return;

  memoryFallbackCache = schedules;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SCHEDULES_STORE, META_STORE], "readwrite");
      const store = tx.objectStore(SCHEDULES_STORE);
      const meta = tx.objectStore(META_STORE);

      store.put({
        id: "active_schedules_payload",
        schedules,
        updatedAt: Date.now(),
        count: schedules.length,
        version: "2.0"
      });

      meta.put({
        key: "last_sync_timestamp",
        timestamp: Date.now()
      });

      tx.oncomplete = () => {
        // İkincil fallback olarak localStorage'ı da hafifçe güncel tut (küçük boyutlu kopyasıyla)
        try {
          localStorage.setItem("vapur_schedules_last_sync", String(Date.now()));
        } catch {}
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // IndexedDB başarısız olursa (Gizli sekme vb.) güvenli localStorage fallback'i
    try {
      localStorage.setItem("vapur_schedules_cache_v1", JSON.stringify(schedules));
    } catch {}
  }
}

/**
 * Çevrimdışı veya zayıf ağ durumunda kayıtlı resmi tarifeyi IndexedDB'den yükler.
 */
export async function loadSchedulesOffline(): Promise<ScheduleCardDto[] | null> {
  if (memoryFallbackCache && memoryFallbackCache.length > 0) {
    return memoryFallbackCache;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction([SCHEDULES_STORE], "readonly");
      const store = tx.objectStore(SCHEDULES_STORE);
      const request = store.get("active_schedules_payload");

      request.onsuccess = () => {
        const result = request.result;
        if (result && Array.isArray(result.schedules) && result.schedules.length > 0) {
          memoryFallbackCache = result.schedules;
          resolve(result.schedules);
        } else {
          resolve(loadFromLocalStorageFallback());
        }
      };

      request.onerror = () => {
        resolve(loadFromLocalStorageFallback());
      };
    });
  } catch (err) {
    return loadFromLocalStorageFallback();
  }
}

function loadFromLocalStorageFallback(): ScheduleCardDto[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("vapur_schedules_cache_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryFallbackCache = parsed;
        return parsed;
      }
    }
  } catch {}
  return null;
}
