
"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Studios", href: "/studios" },
    { name: "Add Studio", href: "/add-studio" },
    { name: "My Listings", href: "/my-listings" },
    { name: "My Bookings", href: "/my-bookings" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          <span className="text-gray-950">Studio</span>
          <span className="text-orange-600">Space</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-600 transition hover:text-orange-600"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Authentication */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-800 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
              >
                {link.name}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-200" />

            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Login
            </Link>

            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-orange-600 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-orange-700"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
