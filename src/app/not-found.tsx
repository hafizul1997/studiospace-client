
import Link from "next/link";
import Image from "next/image";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="max-w-6xl w-full mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">

          {/* Left Side - Error Content */}
          <div className="text-center md:text-left">

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary mb-5">
              StudioSpace
            </p>

            <h1 className="text-8xl sm:text-9xl font-extrabold tracking-tight text-primary">
              404
            </h1>

            <h2 className="text-3xl sm:text-4xl font-bold mt-4">
              Page Not Found
            </h2>

            <p className="mt-5 text-muted-foreground text-base sm:text-lg leading-8 max-w-md mx-auto md:mx-0">
              Oops! The creative space you are looking for doesn&apos;t exist,
              may have been moved, or is temporarily unavailable.
              Let&apos;s get you back on track!
            </p>

            {/* Return Home Button */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-primary-foreground font-semibold shadow-md hover:opacity-90 transition-all duration-300"
              >
                <Home size={19} />
                Return to Home
              </Link>

            </div>

            {/* Back Link */}
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Homepage
            </Link>

          </div>

          {/* Right Side - Studio Illustration */}
          <div className="relative w-full max-w-xl mx-auto">

            <Image
              src="/404-studio.png"
              alt="Creative photography studio illustration"
              width={900}
              height={650}
              priority
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

          </div>

        </div>

      </div>
    </main>
  );
}
