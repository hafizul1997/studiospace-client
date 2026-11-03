
import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          StudioSpace
        </p>

        <h1 className="mt-6 text-8xl sm:text-9xl font-extrabold text-primary">
          404
        </h1>

        <h2 className="mt-5 text-2xl sm:text-3xl font-bold">
          Page Not Found
        </h2>

        <p className="mt-4 text-muted-foreground leading-7">
          Sorry! The page you are looking for doesn&apos;t exist,
          may have been moved, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            <Home size={18} />
            Back to Home
          </Link>

          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 font-semibold hover:bg-muted transition"
          >
            <Search size={18} />
            Explore Studios
          </Link>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
