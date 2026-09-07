"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export function AIIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

const mainNavItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: "🏠" },
  { label: "Soil Trend", href: "/soil-trend", icon: "📈" },
  { label: "History", href: "/history", icon: "📊" },
  { label: "AI Farm Assistant", href: "/ai-assistant", icon: <AIIcon className="w-5 h-5 stroke-[2.2]" /> },
  { label: "Alerts", href: "/alerts", icon: "🔔" },
];

const bottomNavItems: NavItem[] = [
  { label: "Profile", href: "/profile", icon: "👤" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href !== "/dashboard" && pathname.startsWith(href)) return true;
    return false;
  };

  const renderNavLinks = (items: NavItem[]) => (
    <ul className="space-y-1.5">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                active
                  ? "bg-green-700 text-white shadow-md shadow-green-900/10 font-bold"
                  : "text-gray-700 hover:bg-green-50 hover:text-green-800"
              }`}
            >
              <span className="text-xl flex items-center justify-center w-6 h-6 shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* ======================================================
          MOBILE HEADER BAR WITH HAMBURGER TOGGLE
      ====================================================== */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-green-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🌱</span>
          <div>
            <h1 className="text-base font-bold text-green-800 leading-tight">
              SOIL HEALTH
            </h1>
            <p className="text-[11px] font-medium text-gray-500">
              Farmer Assistant
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="rounded-xl border border-gray-200 bg-gray-50 p-2 text-gray-700 hover:bg-green-50 hover:text-green-800 focus:outline-none"
        >
          <span className="text-xl">{mobileOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      {/* ======================================================
          MOBILE DRAWER BACKDROP & OVERLAY
      ====================================================== */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ======================================================
          MOBILE DRAWER SIDEBAR
      ====================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* BRANDING */}
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <span className="text-3xl">🌱</span>
            <div>
              <h2 className="text-lg font-bold text-green-800 leading-tight">
                SOIL HEALTH
              </h2>
              <p className="text-xs font-medium text-gray-500">
                Farmer Assistant
              </p>
            </div>
          </div>

          {/* MAIN NAV */}
          <nav className="space-y-1">{renderNavLinks(mainNavItems)}</nav>

          {/* DIVIDER */}
          <hr className="my-5 border-gray-200" />

          {/* BOTTOM NAV */}
          <nav className="space-y-1">{renderNavLinks(bottomNavItems)}</nav>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
          Soil Health PWA v1.0
        </div>
      </aside>

      {/* ======================================================
          DESKTOP SIDEBAR (FIXED LEFT PANEL)
      ====================================================== */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col justify-between rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
          <div>
            {/* BRANDING */}
            <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <span className="text-3xl">🌱</span>
              <div>
                <h2 className="text-lg font-bold text-green-800 leading-tight">
                  SOIL HEALTH
                </h2>
                <p className="text-xs font-medium text-gray-500">
                  Farmer Assistant
                </p>
              </div>
            </div>

            {/* MAIN NAV */}
            <nav className="space-y-1">{renderNavLinks(mainNavItems)}</nav>

            {/* DIVIDER */}
            <hr className="my-5 border-gray-200" />

            {/* BOTTOM NAV */}
            <nav className="space-y-1">{renderNavLinks(bottomNavItems)}</nav>
          </div>

          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400 font-medium">
            Soil Health Assistant
          </div>
        </div>
      </aside>
    </>
  );
}
