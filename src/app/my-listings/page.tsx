
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Loader2,
  AlertCircle,
  PlusCircle,
} from "lucide-react";

interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  location: string;
  imageUrl: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
}

interface ApiError {
  success?: boolean;
  message?: string;
}

const readJsonResponse = async (response: Response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Server returned an invalid response. Please try again."
    );
  }
};

export default function MyListingsPage() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const fetchMyListings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Use Next.js same-origin proxy.
      const response = await fetch("/api/backend/my-listings", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = (await readJsonResponse(response)) as
        | Studio[]
        | ApiError;

      if (!response.ok) {
        const message =
          !Array.isArray(data) && data.message
            ? data.message
            : "Failed to load your listings.";

        throw new Error(message);
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid response received from server."
        );
      }

      setStudios(data);
      setSearched(true);
    } catch (err) {
      console.error("Fetch my listings error:", err);

      setStudios([]);
      setSearched(true);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchMyListings();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchMyListings]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 transition-colors dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">

        {/* Page Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Listings
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and view the studios you have added.
            </p>
          </div>

          <Link
            href="/add-studio"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            <PlusCircle className="h-5 w-5" />
            Add New Studio
          </Link>
        </div>

        {/* Listing Information and Refresh */}
        <section className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Your Studio Listings
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              These listings are connected to your logged-in account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchMyListings()}
            disabled={loading}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Refresh Listings
              </>
            )}
          </button>
        </section>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-900">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-orange-500" />

            <p className="text-gray-600 dark:text-gray-400">
              Loading your studios...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && searched && !error && studios.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/50">
              <PlusCircle className="h-7 w-7 text-orange-500" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              No Listings Found
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              You have not added any studios yet.
            </p>

            <Link
              href="/add-studio"
              className="mt-5 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Add Your First Studio
            </Link>
          </div>
        )}

        {/* Studio Cards */}
        {!loading && !error && studios.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Your Studios
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
                {studios.length} Listings
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => (
                <div
                  key={studio._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Studio Image */}
                  <div className="relative h-52 w-full bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={studio.imageUrl}
                      alt={studio.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Studio Information */}
                  <div className="p-5">
                    <span className="text-sm font-medium text-orange-500">
                      {studio.category}
                    </span>

                    <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                      {studio.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      📍 {studio.location}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                      {studio.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="font-bold text-gray-900 dark:text-white">
                        AED {studio.hourlyRate}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {" "}
                          / hour
                        </span>
                      </p>

                      <Link
                        href={`/studios/${studio._id}`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        View Studio
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
