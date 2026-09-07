"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import { useSoil, type HistoryItem } from "../../lib/soil-context";

type HoverInfo = {
  x: number;
  y: number;
  year: number;
  value: number;
  series: "Forecast" | "Historical";
} | null;

function TrendChart({
  forecastYears,
  forecastValues,
  history,
}: {
  forecastYears: number[];
  forecastValues: (number | string)[];
  history: HistoryItem[];
}) {
  const [hovered, setHovered] = useState<HoverInfo>(null);

  // Parse forecast points
  const validForecasts = forecastYears
    .map((year, idx) => {
      const raw = forecastValues[idx];
      const val = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      return { year, value: isNaN(val) ? null : val };
    })
    .filter((p): p is { year: number; value: number } => p.value !== null);

  // Parse historical points
  const validHistory = history
    .map((item) => {
      const yr = new Date(item.timestamp || Date.now()).getFullYear();
      const raw = item.result?.soil_health_score;
      const val = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      return { year: yr, value: isNaN(val) ? null : val, date: item.date };
    })
    .filter((p): p is { year: number; value: number; date: string } => p.value !== null);

  // Distinct sorted years
  const allYears = Array.from(
    new Set([
      ...validHistory.map((h) => h.year),
      ...validForecasts.map((f) => f.year),
    ])
  ).sort((a, b) => a - b);

  if (allYears.length === 0) return null;

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingLeft = 55;
  const paddingRight = 35;
  const paddingTop = 35;
  const paddingBottom = 45;

  const innerWidth = svgWidth - paddingLeft - paddingRight;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (year: number) => {
    if (allYears.length === 1) return paddingLeft + innerWidth / 2;
    const index = allYears.indexOf(year);
    if (index === -1) return paddingLeft;
    return paddingLeft + index * (innerWidth / (allYears.length - 1));
  };

  const getY = (value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    return paddingTop + (1 - clamped / 100) * innerHeight;
  };

  // Coordinates for Forecast
  const forecastCoords = validForecasts.map((f) => ({
    x: getX(f.year),
    y: getY(f.value),
    year: f.year,
    value: f.value,
  }));

  const forecastPathD = forecastCoords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  // Coordinates for History
  const histCoords = validHistory.map((h) => ({
    x: getX(h.year),
    y: getY(h.value),
    year: h.year,
    value: h.value,
    date: h.date,
  }));

  const histPathD = histCoords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  const yTicks = [100, 75, 50, 25, 0];

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto select-none"
      >
        {/* BACKGROUND GRID & Y TICKS */}
        {yTicks.map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={svgWidth - paddingRight}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-400 text-[11px] font-semibold"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Y AXIS LABEL */}
        <text
          x={paddingLeft - 38}
          y={paddingTop + innerHeight / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${paddingLeft - 38}, ${paddingTop + innerHeight / 2})`}
          className="fill-gray-500 text-[10px] font-bold tracking-wider uppercase"
        >
          Score / Index (0-100)
        </text>

        {/* X TICKS (YEARS) */}
        {allYears.map((year) => {
          const x = getX(year);
          return (
            <g key={year}>
              <line
                x1={x}
                y1={svgHeight - paddingBottom}
                x2={x}
                y2={svgHeight - paddingBottom + 5}
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={svgHeight - paddingBottom + 20}
                textAnchor="middle"
                className="fill-gray-700 text-xs font-bold"
              >
                {year}
              </text>
            </g>
          );
        })}

        {/* HISTORICAL CONNECTING LINE (SOLID BLUE) */}
        {histCoords.length > 1 && (
          <path
            d={histPathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* FORECAST CONNECTING LINE (DASHED GREEN) */}
        {forecastCoords.length > 1 && (
          <path
            d={forecastPathD}
            fill="none"
            stroke="#16a34a"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* HISTORICAL DATA POINTS */}
        {histCoords.map((pt, idx) => (
          <circle
            key={`hist-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r="6"
            className="cursor-pointer fill-blue-600 stroke-white stroke-2 transition-all duration-150 hover:r-8"
            onMouseEnter={() =>
              setHovered({
                x: pt.x,
                y: pt.y,
                year: pt.year,
                value: pt.value,
                series: "Historical",
              })
            }
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* FORECAST DATA POINTS */}
        {forecastCoords.map((pt, idx) => (
          <circle
            key={`fc-${idx}`}
            cx={pt.x}
            cy={pt.y}
            r="6"
            className="cursor-pointer fill-green-600 stroke-white stroke-2 transition-all duration-150 hover:r-8"
            onMouseEnter={() =>
              setHovered({
                x: pt.x,
                y: pt.y,
                year: pt.year,
                value: pt.value,
                series: "Forecast",
              })
            }
            onMouseLeave={() => setHovered(null)}
          />
        ))}

        {/* HOVER TOOLTIP */}
        {hovered && (
          <g transform={`translate(${Math.min(svgWidth - 75, Math.max(75, hovered.x))}, ${Math.max(45, hovered.y - 45)})`}>
            <rect
              x="-65"
              y="-18"
              width="130"
              height="36"
              rx="8"
              className="fill-gray-900/95 stroke-gray-700 stroke-1 shadow-lg"
            />
            <text
              x="0"
              y="-3"
              textAnchor="middle"
              className="fill-white text-[11px] font-bold"
            >
              {hovered.year}: {hovered.value}/100
            </text>
            <text
              x="0"
              y="11"
              textAnchor="middle"
              className={hovered.series === "Forecast" ? "fill-green-400 text-[9px] font-semibold" : "fill-blue-300 text-[9px] font-semibold"}
            >
              {hovered.series === "Forecast" ? "Model Forecast" : "Historical Test"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function SoilTrendPage() {
  const { latestResult, history } = useSoil();
  const [showGraph, setShowGraph] = useState(false);

  const riskScore =
    latestResult?.degradation_risk?.degradation_risk_score ?? "N/A";
  const riskLevel =
    latestResult?.degradation_risk?.degradation_risk_level ?? "N/A";
  const forecastYears =
    latestResult?.degradation_trend?.forecast_years ?? [];
  const forecastValues =
    latestResult?.degradation_trend?.forecast_values ?? [];

  const hasRealTrendData = forecastValues.length > 0;
  const hasHistoricalData = history.some(
    (item) => item.result?.soil_health_score !== undefined && item.result?.soil_health_score !== null
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📈</span>
              <div>
                <h1 className="text-2xl font-bold text-green-900">
                  Detailed Soil Health Trend
                </h1>
                <p className="text-sm text-gray-600">
                  Multi-year degradation forecasting & long-term soil health analysis
                </p>
              </div>
            </div>

            {/* EXPANDABLE GRAPH TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => setShowGraph((prev) => !prev)}
              aria-label="Toggle trend graph"
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition shadow-sm ${
                showGraph
                  ? "bg-green-800 text-white ring-2 ring-green-600"
                  : "bg-green-50 text-green-800 border border-green-200 hover:bg-green-100"
              }`}
            >
              <span className="text-lg">📊</span>
              <span>{showGraph ? "Hide Trend Graph" : "Trend Graph"}</span>
            </button>
          </div>
        </div>

        {/* EXPANDABLE TREND GRAPH PANEL */}
        {showGraph && (
          <div className="overflow-hidden rounded-2xl border border-green-200 bg-white p-5 sm:p-6 shadow-md transition-all duration-300">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>📊</span>
                  <span>Soil Quality & Degradation Trend Graph</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visual representation of multi-year soil health forecast & historical testing
                </p>
              </div>

              {hasRealTrendData && (
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-5 rounded-full bg-green-600 border border-green-700"></span>
                    <span className="text-gray-700">Model Forecast (Dashed)</span>
                  </div>
                  {hasHistoricalData && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-5 rounded-full bg-blue-600"></span>
                      <span className="text-gray-700">Historical Tests (Solid)</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {hasRealTrendData ? (
              <TrendChart
                forecastYears={forecastYears}
                forecastValues={forecastValues}
                history={history}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center">
                <span className="text-3xl">🌱</span>
                <h3 className="mt-2 text-base font-bold text-amber-900">
                  No Forecast Data Available For Graphing
                </h3>
                <p className="mt-1 text-xs text-amber-700 max-w-md mx-auto">
                  Run a soil test from the Home page using your soil image and parameters to generate long-term forecast points for the trend graph.
                </p>
              </div>
            )}
          </div>
        )}

        {/* LATEST RESULT OVERVIEW CARD */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Soil Type
            </p>
            <p className="mt-2 text-2xl font-black text-gray-900">
              {latestResult?.soil_type || "No Test Conducted"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {latestResult ? "From latest analysis" : "Perform a test on Home page"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Degradation Risk Score
            </p>
            <p className="mt-2 text-2xl font-black text-green-700">
              {riskScore}{riskScore !== "N/A" && !String(riskScore).includes("/") ? "/100" : ""}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Current calculated risk level
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Risk Assessment Category
            </p>
            <p className="mt-2 text-2xl font-black text-amber-600">
              {riskLevel}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Based on physical & chemical parameters
            </p>
          </div>
        </div>

        {/* DETAILED TREND FORECAST SECTION */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              🔮 5-Year Soil Quality Forecast
            </h2>
            {hasRealTrendData && (
              <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                Verified Model Projection
              </span>
            )}
          </div>

          {hasRealTrendData ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Projected soil health score progression over the next 5 years based on current nutrient management:
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {forecastYears.map((year, idx) => {
                  const val = forecastValues[idx] ?? "N/A";
                  return (
                    <div
                      key={year}
                      className="rounded-xl border border-green-200 bg-green-50/70 p-4 text-center"
                    >
                      <p className="text-xs font-bold text-gray-500">{year}</p>
                      <p className="mt-1 text-xl font-black text-green-800">
                        {val}
                      </p>
                      <p className="text-[11px] text-gray-500">Score / 100</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center">
              <span className="text-3xl">🌱</span>
              <h3 className="mt-2 text-base font-bold text-amber-900">
                No Soil Analysis Available Yet
              </h3>
              <p className="mt-1 text-xs text-amber-700 max-w-md mx-auto">
                No soil analysis available yet. Complete a soil analysis on Home to view your soil trend.
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-block rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-green-800 transition"
              >
                Go to Home & Analyze Soil
              </Link>
            </div>
          )}
        </div>

        {/* RESTORATION & SUSTAINABILITY GUIDELINES */}
        <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            🛡️ Soil Degradation Prevention Recommendations
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-green-50 p-4 border border-green-200">
              <p className="font-bold text-green-900 text-sm">🍂 Organic Carbon Enrichment</p>
              <p className="mt-1 text-xs text-gray-700">
                Apply FYM (Farm Yard Manure) or compost at 5 tons/acre annually to build soil organic carbon and increase moisture retention.
              </p>
            </div>
            <div className="rounded-xl bg-green-50 p-4 border border-green-200">
              <p className="font-bold text-green-900 text-sm">🔄 Balanced Crop Rotation</p>
              <p className="mt-1 text-xs text-gray-700">
                Rotate heavy feeder crops (e.g. Rice, Sugarcane) with nitrogen-fixing pulses (e.g. Gram, Groundnut) to restore natural soil fertility.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
