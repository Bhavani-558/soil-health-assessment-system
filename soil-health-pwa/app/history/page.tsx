"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useSoil, formatDeficiencies, formatFertilizers, type HistoryItem } from "../../lib/soil-context";
import { generateSoilReportPDF, type FormState } from "../../lib/pdf-generator";

export default function HistoryPage() {
  const { history, clearHistory } = useSoil();
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const downloadPDFForHistory = async (item: HistoryItem) => {
    const dummyForm: FormState = {
      nitrogen: "40",
      phosphorus: "20",
      potassium: "30",
      ph: "6.5",
      moisture: "34",
      organic_c: "0.8",
      electrical_conductivity: "1.5",
      temperature: "25",
      humidity: "60",
      rainfall: "800",
      soil_type: item.soilType || "Black Soil",
      crop_type: item.cropType || "Rice",
      crop_growth: "Good",
      season: "Kharif",
      irrigation: "Irrigated",
      previous_crop: "Wheat",
      region: item.region || "Andhra Pradesh",
      fertilizer_used_last: "50",
    };

    await generateSoilReportPDF({
      result: item.result,
      formData: dummyForm,
      language: "en",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold text-green-900">
                Analysis History
              </h1>
              <p className="text-sm text-gray-600">
                Local browser records of your analyzed soil tests
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {/* STORAGE NOTICE BANNER */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-medium text-blue-900">
          💡 <strong>Local Storage Notice:</strong> History items are saved securely in your browser&apos;s local storage for convenience during your session.
        </div>

        {/* HISTORY LIST */}
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <span className="text-4xl">🌱</span>
            <h3 className="mt-3 text-lg font-bold text-gray-800">
              No Saved Soil Analyses Yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              When you capture a soil photo and perform an analysis on Home, your results will automatically appear here.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-block rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white shadow hover:bg-green-800 transition"
            >
              Perform Soil Analysis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-green-300 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                      {item.soilType}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      • {item.date}
                    </span>
                  </div>
                  <p className="text-base font-bold text-gray-900">
                    Deficiency: {item.result.nutrient_deficiency ? formatDeficiencies(item.result.nutrient_deficiency) : "Balanced"}
                  </p>
                  <p className="text-xs text-gray-600">
                    Fertilizer: {item.result.fertilizer_dosage?.fertilizer ? formatFertilizers(item.result.fertilizer_dosage.fertilizer) : "N/A"} ({item.result.fertilizer_dosage?.dosage_kg_per_acre || "0"} kg/acre)
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right mr-2">
                    <p className="text-xs text-gray-500 font-bold">Health Score</p>
                    <p className="text-xl font-black text-green-800">
                      {item.result.soil_health_score ?? "N/A"}/100
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="rounded-xl border border-green-600 bg-green-50 px-3.5 py-2 text-xs font-bold text-green-800 hover:bg-green-100 transition"
                  >
                    🔍 Details
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadPDFForHistory(item)}
                    className="rounded-xl bg-green-700 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-green-800 transition"
                  >
                    📄 PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Soil Analysis Details ({selectedItem.date})
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm text-gray-800">
                <div className="rounded-xl bg-green-50 p-3">
                  <p className="font-bold text-green-900">Soil Health Score: {selectedItem.result.soil_health_score}/100</p>
                  <p className="text-xs text-gray-600">Category: {selectedItem.result.soil_health_category}</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Nutrient Deficiency:</p>
                  <p className="text-gray-700">{selectedItem.result.nutrient_deficiency ? formatDeficiencies(selectedItem.result.nutrient_deficiency) : "N/A"}</p>
                </div>

                <div>
                  <p className="font-bold text-gray-900">Recommended Fertilizer:</p>
                  <p className="text-gray-700">
                    {selectedItem.result.fertilizer_dosage?.fertilizer ? formatFertilizers(selectedItem.result.fertilizer_dosage.fertilizer) : "N/A"} - {selectedItem.result.fertilizer_dosage?.dosage_kg_per_acre ?? "N/A"} kg/acre
                  </p>
                </div>

                {selectedItem.result.crop_suitability && selectedItem.result.crop_suitability.length > 0 && (
                  <div>
                    <p className="font-bold text-gray-900">Recommended Crops:</p>
                    <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 mt-1">
                      {selectedItem.result.crop_suitability.map((c, i) => (
                        <li key={i}>{c.crop} ({c.suitability_score}/100)</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
