
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
    const fetchStudios = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/studios"
        );

        if (!response.ok) {
          throw new Error("Failed to load studios");
        }

        const data: Studio[] = await response.json();
        setStudios(data);
      } catch (error) {
        console.error("Fetch studios error:", error);
        setError("Unable to load studios. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudios();
  }, []);

  // Filter studios
  const filteredStudios = useMemo(() => {
    return studios.filter((studio) => {
      const matchesCategory =
        selectedCategory === "All Categories" ||
        studio.category === selectedCategory;

      const matchesSearch =
        studio.title.toLowerCase().includes(search.toLowerCase()) ||
        studio.location.toLowerCase().includes(search.toLowerCase());

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
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-600">
            Find Your Creative Space
          </p>

          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Explore Studios
          </h1>

          <p className="mt-3 text-gray-600">
            Discover the perfect space for your next creative project.
          </p>
        </div>

        {/* Search and Category Filter */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

           <input
  type="text"
  placeholder="Search by studio name or location..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-green-600"
/>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-green-600"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Loading */}
        {loading && (
          <p className="py-16 text-center text-gray-500">
            Loading studios...
          </p>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="py-16 text-center text-red-500">
            {error}
          </p>
        )}

        {/* Studio Results */}
        {!loading && !error && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Available Studios
              </h2>

              <p className="text-sm text-gray-500">
                {filteredStudios.length} studios found
              </p>
            </div>

            {filteredStudios.length === 0 ? (
              <div className="rounded-2xl bg-white py-20 text-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  No studios found
                </h3>

                <p className="mt-2 text-gray-500">
                  Try another category or search keyword.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudios.map((studio) => (
                  <div
                    key={studio._id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-56">
                      <Image
                        src={studio.imageUrl}
                        alt={studio.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700">
                        {studio.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900">
                        {studio.title}
                      </h3>

                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={16} />
                        {studio.location}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="font-bold text-green-700">
                          AED {studio.hourlyRate}
                          <span className="text-sm font-normal text-gray-500">
                            /hour
                          </span>
                        </p>

                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Star
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          {studio.rating ?? "New"}
                        </span>
                      </div>

                      <Link
                        href={`/studios/${studio._id}`}
                        className="mt-5 block rounded-lg bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700"
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
    <Suspense fallback={<p className="py-20 text-center">Loading...</p>}>
      <StudiosContent />
    </Suspense>
  );
}