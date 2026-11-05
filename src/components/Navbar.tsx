
"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

// Prevent hydration mismatch without useEffect or setState
const subscribe = () => () => {};

export default function Navbar() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // False during SSR, true after hydration
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Studios", href: "/studios" },
    { name: "Add Studio", href: "/add-studio" },
    { name: "My Listings", href: "/my-listings" },
    { name: "My Bookings", href: "/my-bookings" },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Logout failed");
        return;
      }

      setIsOpen(false);
      setProfileOpen(false);

      toast.success("Logged out successfully!");

      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Something went wrong while logging out.");
    }
  };

  const closeMenus = () => {
    setIsOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="text-2xl font-bold tracking-tight"
        >
          <span className="text-gray-950 dark:text-white">Studio</span>
          <span className="text-orange-600">Space</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 lg:flex">

          {/* Desktop Theme Toggle */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                resolvedTheme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                resolvedTheme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-yellow-300 dark:hover:bg-gray-800"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
          )}

          {isPending ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                aria-expanded={profileOpen}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                  {(user.name || user.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span className="max-w-32 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {user.name || user.email}
                </span>

                <span className="text-xs text-gray-500">▼</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-100 px-3 py-3 dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user.name || "User"}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={closeMenus}
                    className="mt-2 block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    My Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 dark:text-gray-200"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">

          {/* Mobile Theme Toggle */}
          {mounted && (
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title="Toggle theme"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-yellow-300 dark:hover:bg-gray-800"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 dark:border-gray-700 dark:text-white"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-950 lg:hidden">
          <div className="flex flex-col gap-1">

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenus}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {link.name}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-200 dark:border-gray-800" />

            {isPending ? (
              <p className="px-3 py-3 text-sm text-gray-500">
                Checking login...
              </p>
            ) : user ? (
              <>
                <div className="rounded-lg bg-orange-50 px-3 py-3 dark:bg-gray-900">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.name || "User"}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  My Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-200 px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="rounded-lg bg-orange-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-orange-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
