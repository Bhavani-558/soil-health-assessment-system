"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";

export type FertilizerDosage = {
  fertilizer?: string;
  dosage_kg_per_acre?: number | string;
};

export type CropSuitability = {
  crop: string;
  suitability_score: number;
};

export type DegradationRisk = {
  degradation_risk_score?: number | string;
  degradation_risk_level?: string;
};

export type DegradationTrend = {
  forecast_years?: number[];
  forecast_values?: number[];
};

export type SoilResult = {
  soil_type?: string;
  cnn_confidence?: number | string;
  gradcam_image?: string;
  gradcam_image_url?: string;
  gradcam_image_base64?: string;
  gradcam_layer?: string;
  soil_health_score?: number | string;
  soil_health_category?: string;
  nutrient_deficiency?: string;
  fertilizer_dosage?: FertilizerDosage;
  crop_suitability?: CropSuitability[];
  degradation_risk?: DegradationRisk;
  degradation_trend?: DegradationTrend;
};

export type HistoryItem = {
  id: string;
  date: string;
  timestamp: number;
  result: SoilResult;
  soilType: string;
  cropType: string;
  region: string;
};

export type SettingsState = {
  language: "en" | "hi" | "kn";
  voiceLanguage: "en" | "hi" | "kn";
  voiceSpeed: "normal" | "slow" | "fast";
  autoPlayVoice: boolean;
  notificationsEnabled: boolean;
  alertWeather: boolean;
  alertSoilTesting: boolean;
  alertNutrientDeficiency: boolean;
  alertSoilDegradation: boolean;
  alertCropRecommendation: boolean;
};

type SoilContextType = {
  latestResult: SoilResult | null;
  currentHomeResult: SoilResult | null;
  history: HistoryItem[];
  settings: SettingsState;
  addAnalysisResult: (result: SoilResult, form?: any) => void;
  clearHistory: () => void;
  updateSettings: (partialSettings: Partial<SettingsState>) => void;
  clearCurrentHomeResult: () => void;
};

const defaultSettings: SettingsState = {
  language: "en",
  voiceLanguage: "en",
  voiceSpeed: "normal",
  autoPlayVoice: false,
  notificationsEnabled: true,
  alertWeather: true,
  alertSoilTesting: true,
  alertNutrientDeficiency: true,
  alertSoilDegradation: true,
  alertCropRecommendation: true,
};

const SoilContext = createContext<SoilContextType>({
  latestResult: null,
  currentHomeResult: null,
  history: [],
  settings: defaultSettings,
  addAnalysisResult: () => {},
  clearHistory: () => {},
  updateSettings: () => {},
  clearCurrentHomeResult: () => {},
});

const getStorageKeys = (uid?: string | null) => {
  const suffix = uid ? `_${uid}` : "";
  return {
    latestKey: `soil_health_pwa_latest_v1${suffix}`,
    historyKey: `soil_health_pwa_history_v1${suffix}`,
    settingsKey: `soil_health_pwa_settings_v1${suffix}`,
  };
};

export const MAX_HISTORY_ITEMS = 20;

/**
 * Strips large binary/base64 blobs from a SoilResult object for safe localStorage persistence.
 * Retains all numerical data, text classifications, crop arrays, degradation risk/trend scores,
 * and lightweight URL/filename references.
 */
export function compactSoilResult(result: SoilResult | null | undefined): SoilResult | null {
  if (!result) return null;

  const copy: SoilResult = { ...result };

  // Remove huge base64 image strings
  delete copy.gradcam_image_base64;

  // Strip base64 data URIs from gradcam_image if present
  if (typeof copy.gradcam_image === "string") {
    if (
      copy.gradcam_image.startsWith("data:") ||
      copy.gradcam_image.length > 256 ||
      (!copy.gradcam_image.startsWith("/") && !copy.gradcam_image.startsWith("http"))
    ) {
      delete copy.gradcam_image;
    }
  }

  // Preserve lightweight URL reference if gradcam_image was removed
  if (!copy.gradcam_image && copy.gradcam_image_url) {
    if (typeof copy.gradcam_image_url === "string" && copy.gradcam_image_url.length <= 256) {
      copy.gradcam_image = copy.gradcam_image_url;
    }
  }

  return copy;
}

/**
 * Compacts a history item to ensure no large base64 payloads enter localStorage.
 */
export function compactHistoryItem(item: HistoryItem): HistoryItem {
  return {
    ...item,
    result: compactSoilResult(item.result) || {},
  };
}

/**
 * Safely sets an item in localStorage.
 * Catches QuotaExceededError and attempts emergency recovery by clearing bloated items
 * or pruning older history entries.
 */
function safeSetLocalStorage(key: string, data: any): boolean {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    return true;
  } catch (e: any) {
    console.warn(`localStorage setItem failed for key "${key}":`, e);

    if (
      e?.name === "QuotaExceededError" ||
      e?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      e?.code === 22 ||
      e?.code === 1014
    ) {
      console.error("QuotaExceededError detected! Executing emergency storage recovery...");
      try {
        if (Array.isArray(data)) {
          // Keep newest 5 compact history items on quota error
          const pruned = data.slice(0, 5).map(compactHistoryItem);
          localStorage.setItem(key, JSON.stringify(pruned));
          console.info("Emergency storage recovery succeeded: Saved 5 compact history items.");
          return true;
        } else if (typeof data === "object" && data !== null) {
          const compacted = compactSoilResult(data);
          localStorage.setItem(key, JSON.stringify(compacted));
          console.info("Emergency storage recovery succeeded: Saved compact result.");
          return true;
        }
      } catch (retryErr) {
        console.error("Emergency storage recovery failed:", retryErr);
        try {
          // Remove only affected bloated history key to unblock application
          localStorage.removeItem(key);
        } catch (_) {}
      }
    }
    return false;
  }
}

export function SoilProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [latestResult, setLatestResult] = useState<SoilResult | null>(null);
  const [currentHomeResult, setCurrentHomeResult] = useState<SoilResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    const keys = getStorageKeys(user?.uid);
    try {
      // 1. Load latest result & sanitize
      const storedLatest = localStorage.getItem(keys.latestKey);
      if (storedLatest) {
        const parsedLatest: SoilResult = JSON.parse(storedLatest);
        const compactedLatest = compactSoilResult(parsedLatest);
        setLatestResult(compactedLatest);
        // Overwrite bloated storedLatest with compact version
        if (
          parsedLatest?.gradcam_image_base64 ||
          (typeof parsedLatest?.gradcam_image === "string" && parsedLatest.gradcam_image.length > 256)
        ) {
          safeSetLocalStorage(keys.latestKey, compactedLatest);
        }
      } else {
        setLatestResult(null);
      }

      // 2. Load history and migrate existing oversized items
      const storedHistory = localStorage.getItem(keys.historyKey);
      if (storedHistory) {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistory);
        let needsMigration = storedHistory.length > 20000;

        const sanitizedHistory = (Array.isArray(parsedHistory) ? parsedHistory : [])
          .map((item) => {
            if (
              item.result?.gradcam_image_base64 ||
              (typeof item.result?.gradcam_image === "string" && item.result.gradcam_image.length > 256)
            ) {
              needsMigration = true;
            }
            return compactHistoryItem(item);
          })
          .slice(0, MAX_HISTORY_ITEMS);

        setHistory(sanitizedHistory);

        if (needsMigration || parsedHistory.length > MAX_HISTORY_ITEMS) {
          console.info("Migrated & sanitized oversized history entries in localStorage.");
          safeSetLocalStorage(keys.historyKey, sanitizedHistory);
        }
      } else {
        setHistory([]);
      }

      // 3. Load settings
      const storedSettings = localStorage.getItem(keys.settingsKey);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        setSettings(defaultSettings);
      }
    } catch (e) {
      console.error("Failed to load or migrate soil data from localStorage:", e);
    }
  }, [user?.uid]);

  const addAnalysisResult = useCallback(
    (result: SoilResult, form?: any) => {
      // Keep full result in React memory for active page rendering and PDF export
      setLatestResult(result);
      setCurrentHomeResult(result);

      const keys = getStorageKeys(user?.uid);

      // Save compact result to localStorage
      const compactLatest = compactSoilResult(result);
      safeSetLocalStorage(keys.latestKey, compactLatest);

      const newItem: HistoryItem = {
        id: "analysis_" + Date.now(),
        date: new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: Date.now(),
        result: compactLatest || {},
        soilType: result.soil_type || form?.soil_type || "Unknown Soil",
        cropType: form?.crop_type || "General",
        region: form?.region || "India",
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev.map(compactHistoryItem)].slice(0, MAX_HISTORY_ITEMS);
        safeSetLocalStorage(keys.historyKey, updated);
        return updated;
      });
    },
    [user?.uid]
  );

  const clearCurrentHomeResult = useCallback(() => {
    setCurrentHomeResult(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setLatestResult(null);
    setCurrentHomeResult(null);
    const keys = getStorageKeys(user?.uid);
    try {
      localStorage.removeItem(keys.historyKey);
      localStorage.removeItem(keys.latestKey);
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  }, [user?.uid]);

  const updateSettings = useCallback(
    (partialSettings: Partial<SettingsState>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...partialSettings };
        const keys = getStorageKeys(user?.uid);
        safeSetLocalStorage(keys.settingsKey, updated);
        return updated;
      });
    },
    [user?.uid]
  );

  const value = useMemo(
    () => ({
      latestResult,
      currentHomeResult,
      history,
      settings,
      addAnalysisResult,
      clearHistory,
      updateSettings,
      clearCurrentHomeResult,
    }),
    [
      latestResult,
      currentHomeResult,
      history,
      settings,
      addAnalysisResult,
      clearHistory,
      updateSettings,
      clearCurrentHomeResult,
    ]
  );

  return <SoilContext.Provider value={value}>{children}</SoilContext.Provider>;
}

export function useSoil() {
  return useContext(SoilContext);
}

/**
 * Formats a raw nutrient deficiency string or array into natural, readable language.
 * Replaces "+" separators with proper natural list joining ("A, B and C").
 *
 * Example:
 *   "Nitrogen deficiency + Phosphorus deficiency + Potassium deficiency"
 *   -> "Nitrogen deficiency, Phosphorus deficiency and Potassium deficiency"
 */
export function formatDeficiencies(
  deficiency: string | string[] | null | undefined,
  language: "en" | "hi" | "kn" = "en"
): string {
  if (!deficiency) return "";

  let items: string[] = [];

  if (Array.isArray(deficiency)) {
    items = deficiency
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } else if (typeof deficiency === "string") {
    items = deficiency
      .split("+")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  const andWord = language === "hi" ? "और" : language === "kn" ? "ಮತ್ತು" : "and";

  if (items.length === 2) {
    return `${items[0]} ${andWord} ${items[1]}`;
  }

  const firstParts = items.slice(0, -1).join(", ");
  const lastPart = items[items.length - 1];

  return `${firstParts} ${andWord} ${lastPart}`;
}

/**
 * Formats a raw fertilizer string or array into natural presentation format for display and voice.
 * Replaces "+" separators with proper natural list joining ("A, B & C" or "A, B and C").
 *
 * Example:
 *   "Urea + DAP + MOP" -> "Urea, DAP & MOP" (useAmpersand: true)
 *   "Urea + DAP + MOP" -> "Urea, DAP and MOP" (useAmpersand: false)
 */
export function formatFertilizers(
  fertilizer: string | string[] | null | undefined,
  options?: {
    useAmpersand?: boolean;
    language?: "en" | "hi" | "kn";
  }
): string {
  if (!fertilizer) return "";

  const useAmpersand = options?.useAmpersand ?? true;
  const language = options?.language ?? "en";

  let items: string[] = [];

  if (Array.isArray(fertilizer)) {
    items = fertilizer
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } else if (typeof fertilizer === "string") {
    items = fertilizer
      .split("+")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (items.length === 0) return "";
  if (items.length === 1) return items[0];

  let andWord = "and";
  if (language === "hi") {
    andWord = "और";
  } else if (language === "kn") {
    andWord = "ಮತ್ತು";
  } else if (useAmpersand) {
    andWord = "&";
  }

  if (items.length === 2) {
    return `${items[0]} ${andWord} ${items[1]}`;
  }

  const firstParts = items.slice(0, -1).join(", ");
  const lastPart = items[items.length - 1];

  return `${firstParts} ${andWord} ${lastPart}`;
}

