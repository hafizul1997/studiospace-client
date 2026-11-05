
"use client";

import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNavbar from "./DashboardNavbar";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Desktop Sidebar */}
      <div className="hidden w-64 shrink-0 lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          {/* Overlay */}
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute inset-0 cursor-pointer bg-black/40 transition"
            aria-label="Close sidebar overlay"
          />

          {/* Sidebar */}
          <div className="absolute inset-y-0 left-0 z-10 shadow-xl">
            <DashboardSidebar
              mobile
              onClose={closeSidebar}
              onNavigate={closeSidebar}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">

        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
