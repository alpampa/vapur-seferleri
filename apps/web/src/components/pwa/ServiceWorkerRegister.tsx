"use client";

import { useEffect } from "react";
import { OfflineMarineGuideBanner } from "./OfflineMarineGuideBanner";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Vapur ServiceWorker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("Vapur ServiceWorker registration failed:", err);
          });
      });
    }
  }, []);

  return <OfflineMarineGuideBanner />;
}
