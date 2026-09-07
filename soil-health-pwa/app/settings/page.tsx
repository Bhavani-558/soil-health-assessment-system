"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useSoil, SettingsState } from "../../lib/soil-context";
import pkg from "../../package.json";

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:bg-gray-50 hover:border-gray-200">
      <div className="space-y-0.5 min-w-0">
        <label htmlFor={id} className="text-sm font-bold text-gray-900 cursor-pointer block truncate">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 leading-snug">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-bold uppercase tracking-wider ${checked ? "text-green-800" : "text-gray-400"}`}>
          {checked ? "ON" : "OFF"}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            checked ? "bg-green-700" : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSoil();
  const [localSettings, setLocalSettings] = useState<SettingsState>(settings);
  const [saved, setSaved] = useState(false);
  const [pwaStatus, setPwaStatus] = useState<string>("Checking...");

  const appVersion = pkg.version || "1.0.0";

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setPwaStatus("Installed");
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaStatus("Available");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if ("BeforeInstallPromptEvent" in window || "serviceWorker" in navigator) {
      setPwaStatus("Available");
    } else {
      setPwaStatus("Not available in this browser");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleChange = (key: keyof SettingsState, value: any) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    updateSettings({ [key]: value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* PAGE HEADER */}
        <div className="w-full rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl shrink-0">⚙️</span>
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Application Settings
              </h1>
              <p className="text-sm text-gray-600">
                Customize your app language, voice synthesis, and notification preferences
              </p>
            </div>
          </div>
        </div>

        {/* SETTINGS FORM */}
        <form onSubmit={handleSave} className="w-full space-y-6">
          {/* 1. INTERFACE LANGUAGE */}
          <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-wide">
                🌐 Interface Language
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी (Hindi)" },
                { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
              ].map((lang) => {
                const isSelected = (localSettings.language || "en") === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleChange("language", lang.code as any)}
                    className={`rounded-xl border p-3.5 text-center text-sm font-bold transition-all ${
                      isSelected
                        ? "border-green-700 bg-green-700 text-white shadow-sm ring-2 ring-green-200"
                        : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SARVAM AI VOICE */}
          <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-wide">
                🔊 Sarvam AI Voice
              </h2>
            </div>

            <div className="space-y-4">
              {/* Voice Language */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <div>
                  <label htmlFor="voiceLanguage" className="text-sm font-bold text-gray-900">
                    Voice Language
                  </label>
                  <p className="text-xs text-gray-500">Language used for AI voice synthesis output</p>
                </div>
                <select
                  id="voiceLanguage"
                  value={localSettings.voiceLanguage || "en"}
                  onChange={(e) => handleChange("voiceLanguage", e.target.value as any)}
                  className="w-full sm:w-56 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 transition cursor-pointer"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                </select>
              </div>

              {/* Voice Speed */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    Voice Speed
                  </span>
                  <p className="text-xs text-gray-500">Adjust the speaking rate of voice playback</p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                  {[
                    { code: "slow", label: "Slow" },
                    { code: "normal", label: "Normal" },
                    { code: "fast", label: "Fast" },
                  ].map((speed) => {
                    const isSelected = (localSettings.voiceSpeed || "normal") === speed.code;
                    return (
                      <button
                        key={speed.code}
                        type="button"
                        onClick={() => handleChange("voiceSpeed", speed.code as any)}
                        className={`rounded-xl border px-4 py-2 text-center text-xs font-bold transition-all ${
                          isSelected
                            ? "border-green-700 bg-green-700 text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        {speed.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-play AI responses */}
              <ToggleSwitch
                id="autoPlayVoice"
                checked={localSettings.autoPlayVoice ?? false}
                onChange={(val) => handleChange("autoPlayVoice", val)}
                label="Auto-play AI responses"
                description="Automatically read aloud assistant responses when generated"
              />
            </div>
          </div>

          {/* 3. NOTIFICATIONS & ALERTS */}
          <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-wide">
                🔔 Notifications & Alerts
              </h2>
            </div>
            <div className="space-y-3">
              <ToggleSwitch
                id="alertWeather"
                checked={localSettings.alertWeather ?? true}
                onChange={(val) => handleChange("alertWeather", val)}
                label="Weather & Seasonal Alerts"
                description="Receive updates on weather impacts and soil moisture advisories"
              />

              <ToggleSwitch
                id="alertSoilTesting"
                checked={localSettings.alertSoilTesting ?? true}
                onChange={(val) => handleChange("alertSoilTesting", val)}
                label="Soil Testing Reminders"
                description="Get periodic reminders for 6-month soil quality tests"
              />

              <ToggleSwitch
                id="alertNutrientDeficiency"
                checked={localSettings.alertNutrientDeficiency ?? true}
                onChange={(val) => handleChange("alertNutrientDeficiency", val)}
                label="Nutrient Deficiency Alerts"
                description="Alerts when Nitrogen, Phosphorus, Potassium or NPK fall below threshold"
              />

              <ToggleSwitch
                id="alertSoilDegradation"
                checked={localSettings.alertSoilDegradation ?? true}
                onChange={(val) => handleChange("alertSoilDegradation", val)}
                label="Soil Degradation Alerts"
                description="Notifications regarding erosion risks and soil quality drops"
              />

              <ToggleSwitch
                id="alertCropRecommendation"
                checked={localSettings.alertCropRecommendation ?? true}
                onChange={(val) => handleChange("alertCropRecommendation", val)}
                label="Crop Recommendation Alerts"
                description="Seasonal crop suitability and optimal planting advice"
              />
            </div>
          </div>

          {/* 4. APP INFORMATION */}
          <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 tracking-wide">
                📱 App Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PWA Status
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      pwaStatus === "Installed"
                        ? "bg-green-600 animate-pulse"
                        : pwaStatus === "Available"
                        ? "bg-blue-600"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-bold text-gray-900">{pwaStatus}</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  App Version
                </span>
                <p className="mt-1 text-sm font-bold text-gray-900">{appVersion}</p>
              </div>
            </div>
          </div>

          {/* 5. SAVE PREFERENCES & SUCCESS MESSAGE */}
          {saved && (
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-900 shadow-sm">
              <span className="text-lg">✅</span>
              <span>Preferences saved successfully! All settings are saved and updated.</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-green-700 px-8 py-3.5 text-sm font-bold text-white shadow hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition active:scale-[0.99] cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
