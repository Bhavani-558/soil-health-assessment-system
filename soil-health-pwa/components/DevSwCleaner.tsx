"use client";

import { useEffect } from "react";

export default function DevSwCleaner() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  return null;
}
