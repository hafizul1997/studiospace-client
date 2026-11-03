
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";

import type { Studio } from "@/app/Type/Studio";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
export default function FeaturedStudios() {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedStudios = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/featured-studios`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch featured studios");
        }

        const data: Studio[] = await response.json();
        setStudios(data);
      } catch (error) {
        console.error("Featured studios error:", error);
        setError("Unable to load studios. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStudios();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      {/* Section Heading */}
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">
            Discover Creative Spaces
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Studios
          </h2>

          <p className="mt-3 max-w-xl text-gray-600">
            Explore our latest creative studios and find the perfect
            space for your next project.
          </p>
        </div>

        <Link
          href="/studios"
          className="inline-flex items-center gap-2 font-semibold text-orange-600 transition hover:text-orange-700"
        >
          Explore All Studios
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-2xl border border-gray-200"
            >
              <div className="h-56 bg-gray-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-6 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && studios.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            No Studios Available
          </h3>
          <p className="mt-2 text-gray-500">
            New creative spaces will appear here soon.
          </p>
        </div>
      )}

      {/* Studio Cards */}
      {!loading && !error && studios.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studios.slice(0, 6).map((studio) => (
            <div
              key={studio._id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-gray-100">
                {studio.imageUrl ? (
                  <Image
                    src={studio.imageUrl}
                    alt={studio.title}
                    fill
                    unoptimized
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No Image Available
                  </div>
                )}

                {/* Category Badge */}
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow">
                  {studio.category}
                </span>

                {/* Rating Badge */}
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  {studio.rating ?? "New"}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="line-clamp-1 text-xl font-bold text-gray-900">
                  {studio.title}
                </h3>

                {/* Location */}
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} className="shrink-0 text-orange-600" />
                  <span className="line-clamp-1">
                    {studio.location}
                  </span>
                </p>

                {/* Price and Duration */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Hourly Rate
                    </p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      AED {studio.hourlyRate}
                      <span className="text-sm font-normal text-gray-500">
                        {" "}/ hour
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={14} />
                    Flexible Booking
                  </div>
                </div>

                {/* View Details */}
                <Link
                  href={`/studios/${studio._id}`}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  View Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
