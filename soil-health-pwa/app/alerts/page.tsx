"use client";

import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useSoil, formatDeficiencies, formatFertilizers } from "../../lib/soil-context";

export default function AlertsPage() {
  const { latestResult, settings, updateSettings } = useSoil();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const alerts = [
    {
      id: "a1",
      title: "Soil Re-testing Reminder",
      type: "Recommendation",
      icon: "📅",
      severity: "medium",
      message:
        "It is recommended to test your farm soil every 6 months to track pH & nutrient levels before monsoon sowing.",
      date: "Scheduled in 45 days",
    },
    {
      id: "a2",
      title: latestResult
        ? `Nutrient Alert: ${
            latestResult.nutrient_deficiency
              ? formatDeficiencies(latestResult.nutrient_deficiency)
              : "Balanced"
          }`
        : "Nutrient Management Alert",
      type: "Nutrient",
      icon: "⚠️",
      severity: "high",
      message: latestResult
        ? `Your latest soil analysis indicates: ${
            latestResult.nutrient_deficiency
              ? formatDeficiencies(latestResult.nutrient_deficiency)
              : "Balanced"
          }. Apply recommended ${
            latestResult.fertilizer_dosage?.fertilizer
              ? formatFertilizers(latestResult.fertilizer_dosage.fertilizer)
              : "fertilizers"
          } at ${
            latestResult.fertilizer_dosage?.dosage_kg_per_acre || "50"
          } kg/acre.`
        : "Perform a soil test on Home to receive custom nutrient deficiency alerts for your farm.",
      date: "Active Alert",
    },
    {
      id: "a3",
      title: "Organic Matter Restoration Alert",
      type: "Soil Quality",
      icon: "🍂",
      severity: "medium",
      message:
        "Maintain soil organic carbon above 0.75% by incorporating crop residues and farmyard manure.",
      date: "Seasonal Advice",
    },
    {
      id: "a4",
      title: latestResult?.degradation_risk
        ? `Soil Degradation Risk: ${latestResult.degradation_risk.degradation_risk_level || "Low Risk"} (${latestResult.degradation_risk.degradation_risk_score ?? 0}/100)`
        : "Soil Degradation Risk Alert",
      type: "Degradation",
      icon: "📈",
      severity:
        latestResult?.degradation_risk?.degradation_risk_score &&
        Number(latestResult.degradation_risk.degradation_risk_score) > 50
          ? "high"
          : "low",
      message: latestResult?.degradation_risk
        ? `Your active soil type (${latestResult.soil_type || "Soil"}) has a degradation risk score of ${latestResult.degradation_risk.degradation_risk_score ?? 0}/100 classified as ${latestResult.degradation_risk.degradation_risk_level || "Low Risk"}.`
        : "Perform a soil test on Home to monitor long-term degradation risk and receive tailored soil restoration advice.",
      date: "Active Alert",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔔</span>
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Farmer Alerts & Reminders
              </h1>
              <p className="text-sm text-gray-600">
                Timely notifications on soil health, fertilizer scheduling, and field management
              </p>
            </div>
          </div>
        </div>

        {/* NOTIFICATION PREFERENCES SECTION */}
        <div className="w-full rounded-2xl border border-green-100 bg-white p-6 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-green-900">
              Notification Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {/* OPTION 1: ENABLE NOTIFICATIONS */}
            <div
              onClick={() =>
                updateSettings({
                  notificationsEnabled: !settings.notificationsEnabled,
                })
              }
              className={`group flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer select-none ${
                settings.notificationsEnabled
                  ? "border-green-300 bg-green-50/70 shadow-sm"
                  : "border-gray-200 bg-gray-50/50 opacity-90 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      settings.notificationsEnabled
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    🔔
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      Enable Notifications
                    </h3>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                      Get important soil-health alerts, recommendations, and reminders.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    settings.notificationsEnabled
                      ? "text-green-800"
                      : "text-gray-500"
                  }`}
                >
                  Status: {settings.notificationsEnabled ? "ON" : "OFF"}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.notificationsEnabled}
                  aria-label="Enable Notifications"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    settings.notificationsEnabled
                      ? "bg-green-700"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.notificationsEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* OPTION 2: SOIL TESTING REMINDERS */}
            <div
              onClick={() =>
                updateSettings({
                  alertSoilTesting: !settings.alertSoilTesting,
                })
              }
              className={`group flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer select-none ${
                settings.alertSoilTesting
                  ? "border-green-300 bg-green-50/70 shadow-sm"
                  : "border-gray-200 bg-gray-50/50 opacity-90 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      settings.alertSoilTesting
                        ? "bg-green-700 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    🧪
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">
                      Soil Testing Reminders
                    </h3>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                      Receive reminders when it is time to test your soil again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    settings.alertSoilTesting
                      ? "text-green-800"
                      : "text-gray-500"
                  }`}
                >
                  Status: {settings.alertSoilTesting ? "ON" : "OFF"}
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.alertSoilTesting}
                  aria-label="Soil Testing Reminders"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                    settings.alertSoilTesting
                      ? "bg-green-700"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.alertSoilTesting
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS LIST WITH EXPANDABLE / COLLAPSIBLE CARDS */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            Active Soil Notifications
          </h2>

          {alerts.map((item) => {
            const isExpanded = !!expandedIds[item.id];

            return (
              <div
                key={item.id}
                onClick={() => toggleExpand(item.id)}
                className={`group rounded-2xl border p-5 shadow-sm transition-all duration-200 cursor-pointer select-none ${
                  item.severity === "high"
                    ? "border-amber-200 bg-amber-50/60 hover:border-amber-300"
                    : "border-green-100 bg-white hover:border-green-300"
                }`}
              >
                {/* SUMMARY ROW (ALWAYS VISIBLE) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base">
                        {item.title}
                      </h3>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline-block">
                      {item.date}
                    </span>

                    <button
                      type="button"
                      aria-label={
                        isExpanded
                          ? "Collapse notification"
                          : "Expand notification"
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-transform group-hover:bg-green-100 group-hover:text-green-800"
                    >
                      <svg
                        className={`h-5 w-5 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* MOBILE DATE BADGE (VISIBLE ON NARROW SCREENS) */}
                <div className="mt-1 sm:hidden">
                  <span className="text-[11px] font-semibold text-gray-400">
                    {item.date}
                  </span>
                </div>

                {/* EXPANDED DESCRIPTION CONTENT */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-black/5 text-xs text-gray-700 leading-relaxed">
                    <p>{item.message}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
