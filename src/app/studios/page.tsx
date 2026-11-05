
"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Search } from "lucide-react";

interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  location: string;
  imageUrl: string;
  rating?: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categories = [
  "All Categories",
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

function StudiosContent() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory =
    searchParams.get("category") || "All Categories";

  // Fetch studios from backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchStudios = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/studios`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load studios");
        }

        const data: Studio[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid studio data received");
        }

        setStudios(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Fetch studios error:", error);
        setError("Unable to load studios. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStudios();

    return () => {
      controller.abort();
    };
  }, []);

  // Filter studios
  const filteredStudios = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return studios.filter((studio) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        studio.category === selectedCategory;

      const matchesSearch =
        studio.title.toLowerCase().includes(searchTerm) ||
        studio.location.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [studios, selectedCategory, search]);

  // Update category in URL
  const handleCategoryChange = (category: string) => {
    if (category === "All Categories") {
      router.push("/studios");
    } else {
      router.push(
        `/studios?category=${encodeURIComponent(category)}`
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">
            Find Your Creative Space
          </p>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Explore Studios
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Discover the perfect space for your next creative project.
          </p>
        </div>

        {/* Search and Category Filter */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">

          {/* Search Input */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
              aria-hidden="true"
            />

            <input
              type="search"
              aria-label="Search studios by name or location"
              placeholder="Search by studio name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-green-500"
            />
          </div>

          {/* Category Select */}
          <select
            aria-label="Filter studios by category"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-green-500"
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
                className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading studios"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="h-56 bg-gray-200 dark:bg-gray-800" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-8 rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 py-16 text-center text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {/* Studio Results */}
        {!loading && !error && (
          <>
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Available Studios
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filteredStudios.length} studios found
              </p>
            </div>

            {/* Empty State */}
            {filteredStudios.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  No studios found
                </h3>

                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Try another category or search keyword.
                </p>
              </div>
            ) : (

              /* Studio Cards */
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudios.map((studio) => (
                  <div
                    key={studio._id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                  >
                    {/* Image */}
                    <div className="relative h-56 bg-gray-100 dark:bg-gray-800">
                      {studio.imageUrl ? (
                        <Image
                          src={studio.imageUrl}
                          alt={studio.title}
                          fill
                          unoptimized
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                          No Image Available
                        </div>
                      )}

                      {/* Category Badge */}
                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700 shadow dark:bg-gray-900 dark:text-green-400">
                        {studio.category}
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {studio.title}
                      </h3>

                      {/* Location */}
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <MapPin
                          size={16}
                          className="shrink-0 text-green-600 dark:text-green-400"
                          aria-hidden="true"
                        />

                        <span className="line-clamp-1">
                          {studio.location}
                        </span>
                      </div>

                      {/* Price and Rating */}
                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bold text-green-700 dark:text-green-400">
                          AED {studio.hourlyRate}
                          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            /hour
                          </span>
                        </p>

                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                            aria-hidden="true"
                          />
                          {studio.rating ?? "New"}
                        </span>
                      </div>

                      {/* View Details */}
                      <Link
                        href={`/studios/${studio._id}`}
                        className="mt-5 block rounded-lg bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus-visible:ring-offset-gray-900"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function StudiosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 py-20 text-center text-gray-500 dark:bg-gray-950 dark:text-gray-400">
          Loading studios...
        </main>
      }
    >
      <StudiosContent />
    </Suspense>
  );
}
