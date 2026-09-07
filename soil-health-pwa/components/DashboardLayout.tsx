"use client";

import type { ReactNode } from "react";
import ProtectedRoute from "./ProtectedRoute";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-green-50/50">
        <div className="flex w-full flex-col lg:flex-row lg:gap-5 p-3 sm:p-4 lg:p-5">
          <Sidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
