"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Star,
  Users,
  ShieldCheck,
  Clock,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

// Studio data type
interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  amenities: string[];
  description: string;
  rating?: number;
}

// Next.js 16 dynamic route params
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudioDetailsPage({ params }: PageProps) {
  const [id, setId] = useState("");

  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get dynamic route ID
  useEffect(() => {
    let isActive = true;

    params
      .then((resolvedParams) => {
        if (isActive) {
          setId(resolvedParams.id);
        }
      })
      .catch((error) => {
        console.error("Route params error:", error);

        if (isActive) {
          setError("Unable to get studio ID.");
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [params]);

  // Fetch studio details from backend
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchStudioDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/studios/${id}`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load studio");
        }

        setStudio(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Studio details error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchStudioDetails();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-500">
          Loading studio details...
        </p>
      </div>
    );
  }

  // Error or not found state
  if (error || !studio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-5">
        <h2 className="text-2xl font-bold text-gray-900">
          Studio Not Found
        </h2>

        <p className="mt-3 text-gray-500">
          {error || "This studio is not available."}
        </p>

        <Link
          href="/studios"
          className="mt-6 rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-700"
        >
          Back to Studios
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-7xl">

        {/* Back Button */}
        <Link
          href="/studios"
          className="mb-8 inline-flex items-center gap-2 text-gray-600 transition hover:text-green-600"
        >
          <ArrowLeft size={18} />
          Back to Studios
        </Link>

        {/* Studio Image */}
        <div className="relative h-72 overflow-hidden rounded-2xl sm:h-100 lg:h-125">
          <Image
            src={studio.imageUrl}
            alt={studio.title}
            fill
            unoptimized
            priority
            className="object-cover"
          />

          <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-700">
            {studio.category}
          </span>
        </div>

        {/* Main Content */}
        <div className="mt-10 grid gap-10 lg:grid-cols-3">

          {/* Left Content */}
          <div className="lg:col-span-2">

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {studio.title}
            </h1>

            {/* Location and Rating */}
            <div className="mt-4 flex flex-wrap items-center gap-5 text-gray-600">
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-green-600" />
                {studio.location}
              </span>

              <span className="flex items-center gap-2">
                <Star
                  size={18}
                  className="fill-yellow-400 text-yellow-400"
                />
                {studio.rating ?? "New"}
              </span>
            </div>

            {/* Description */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                About This Studio
              </h2>

              <p className="mt-4 leading-8 text-gray-600">
                {studio.description || "No description available."}
              </p>
            </section>

            {/* Amenities */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Studio Amenities
              </h2>

              {studio.amenities?.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {studio.amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm"
                    >
                      <CheckCircle
                        size={20}
                        className="text-green-600"
                      />

                      <span className="text-gray-700">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-gray-500">
                  No amenities listed.
                </p>
              )}
            </section>
          </div>

          {/* Right Booking Card */}
          <aside>
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-md">

              <p className="text-sm text-gray-500">
                Hourly Rental Price
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-700">
                AED {studio.hourlyRate}

                <span className="text-base font-normal text-gray-500">
                  {" "}/ hour
                </span>
              </h2>

              {/* Studio Information */}
              <div className="my-6 space-y-5 border-y border-gray-100 py-6">

                {/* Security Deposit */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <ShieldCheck size={19} />
                    Security Deposit
                  </span>

                  <span className="font-semibold text-gray-900">
                    AED {studio.securityDeposit}
                  </span>
                </div>

                {/* Max Capacity */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Users size={19} />
                    Max Capacity
                  </span>

                  <span className="font-semibold text-gray-900">
                    {studio.maxCapacity} People
                  </span>
                </div>

                {/* Booking Type */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Clock size={19} />
                    Booking Type
                  </span>

                  <span className="font-semibold text-gray-900">
                    Hourly
                  </span>
                </div>
              </div>

              {/* Booking Button */}
              <button
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-green-600 py-3 font-semibold text-white opacity-70"
              >
                Booking Coming Soon
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Booking functionality will be available soon.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}