
import Link from "next/link";

const studioCategories = [
  { name: "Photo Studios", category: "Photo Studio" },
  { name: "Film Stages", category: "Film Stage" },
  { name: "Podcast Lounges", category: "Podcast Lounge" },
  { name: "Music Suites", category: "Music Suite" },
  { name: "Art Workshops", category: "Workshop" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand Section */}
          <div className="text-center sm:text-left">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-2xl font-bold text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl">
                S
              </span>
              StudioSpace
            </Link>

            <p className="mx-auto mt-5 max-w-xs text-sm leading-7 text-gray-400 sm:mx-0">
              Discover and book inspiring creative spaces. Find the perfect
              studio for your next photography, film, podcast, or music project.
            </p>

            <div className="mt-6 flex justify-center gap-3 sm:justify-start">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                IG
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                f
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
              >
                in
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-white">
              Quick Links
            </h2>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="transition hover:text-orange-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/studios" className="transition hover:text-orange-400">
                  Explore Studios
                </Link>
              </li>
              <li>
                <Link href="/add-studio" className="transition hover:text-orange-400">
                  Add Your Studio
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className="transition hover:text-orange-400">
                  My Listings
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="transition hover:text-orange-400">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-white">
              Explore Categories
            </h2>

            <ul className="mt-5 space-y-3 text-sm">
              {studioCategories.map((item) => (
                <li key={item.category}>
                  <Link
                    href={`/studios?category=${encodeURIComponent(item.category)}`}
                    className="transition hover:text-orange-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-white">
              Get in Touch
            </h2>

            <p className="mx-auto mt-5 max-w-xs text-sm leading-7 text-gray-400 sm:mx-0">
              Have a question or need help finding the right creative space?
              We would love to hear from you.
            </p>

            <a
              href="mailto:support@studiospace.com"
              className="mt-4 inline-block break-all text-sm text-orange-400 transition hover:text-orange-300"
            >
              support@studiospace.com
            </a>

            <div className="mt-6">
              <Link
                href="/studios"
                className="inline-flex items-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Find Your Studio →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-gray-800 pt-6 text-center text-sm sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-gray-500">
            © 2026 StudioSpace. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center gap-5 sm:justify-end">
            <Link href="/privacy-policy" className="transition hover:text-orange-400">
              Privacy Policy
            </Link>

            <Link href="/terms" className="transition hover:text-orange-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
