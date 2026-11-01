"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

const API_URL = "http://localhost:5000";

export default function MyListingsPage() {
  const [email, setEmail] = useState("");
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await fetch(
        `${API_URL}/api/my-listings?email=${encodeURIComponent(
          email.trim().toLowerCase()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your listings.");
      }

      setStudios(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setStudios([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Listings
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and view the studios you have added.
          </p>
        </div>

        {/* Email Search */}
        <form
          onSubmit={handleSearch}
          className="mb-10 flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your owner email"
            required
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-orange-500 px-7 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Find My Listings"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-12 text-center text-gray-600">
            Loading your studios...
          </div>
        )}

        {/* Empty State */}
        {!loading && searched && !error && studios.length === 0 && (
          <div className="rounded-xl border bg-white py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No Listings Found
            </h2>
            <p className="mt-2 text-gray-500">
              We couldn&apos;t find any studios associated with this email.
            </p>

            <Link
              href="/add-studio"
              className="mt-5 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Add Your First Studio
            </Link>
          </div>
        )}

        {/* Studio Cards */}
        {!loading && studios.length > 0 && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Your Studios
              </h2>

              <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                {studios.length} Listings
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {studios.map((studio) => (
                <div
                  key={studio._id}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                >
                 <div className="relative h-52 w-full">
  <Image
    src={studio.imageUrl}
    alt={studio.title}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    className="object-cover"
  />
</div>

                  <div className="p-5">
                    <span className="text-sm font-medium text-orange-500">
                      {studio.category}
                    </span>

                    <h3 className="mt-2 text-xl font-bold text-gray-900">
                      {studio.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      📍 {studio.location}
                    </p>

                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {studio.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-bold text-gray-900">
                        AED {studio.hourlyRate}
                        <span className="text-sm font-normal text-gray-500">
                          {" "}
                          / hour
                        </span>
                      </p>

                      <Link
                        href={`/studios/${studio._id}`}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
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

        {/* Initial Message */}
        {!searched && (
          <div className="rounded-xl border bg-white py-12 text-center">
            <p className="text-gray-500">
              Enter the email address you used when adding your studio.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}