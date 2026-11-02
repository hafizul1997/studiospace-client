
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  CalendarDays,
  UserRound,
  Settings,
  Home,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Listings", href: "/dashboard/listings", icon: Camera },
  { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { name: "My Profile", href: "/dashboard/profile", icon: UserRound },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardSidebarProps = {
  onNavigate?: () => void;
  onClose?: () => void;
  mobile?: boolean;
};

export default function DashboardSidebar({
  onNavigate,
  onClose,
  mobile = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-white p-5">
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-green-600"
          onClick={onNavigate}
        >
          StudioSpace
        </Link>

        {mobile && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <p className="mb-3 text-xs font-semibold uppercase text-gray-400">
        Dashboard Menu
      </p>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
        >
          <Home size={19} />
          Back to Website
        </Link>
      </div>
    </aside>
  );
}
