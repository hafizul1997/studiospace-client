
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
  ClipboardList,
} from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Listings", href: "/dashboard/listings", icon: Camera },
  { name: "My Bookings", href: "/dashboard/bookings", icon: CalendarDays },
  {
    name: "Booking Requests",
    href: "/dashboard/owner-bookings",
    icon: ClipboardList,
  },
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
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">

      {/* Logo */}
      <div className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-green-600 transition hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          onClick={onNavigate}
        >
          StudioSpace
        </Link>

        {/* Mobile Close Button */}
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Menu Heading */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Dashboard Menu
      </p>

      {/* Navigation */}
      <nav className="space-y-2" aria-label="Dashboard navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition duration-200 ${
                active
                  ? "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              }`}
            >
              <Icon
                size={19}
                className="shrink-0"
              />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to Website */}
      <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
        >
          <Home size={19} className="shrink-0" />
          <span>Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}
