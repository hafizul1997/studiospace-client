"use client";

import { useState } from "react";

const categories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

const availableAmenities = [
  "Wi-Fi",
  "Air Conditioning",
  "Professional Lighting",
  "Soundproofing",
  "Parking",
  "Green Screen",
  "Recording Equipment",
  "Makeup Room",
];

export default function AddStudioPage() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((previous) =>
      previous.includes(amenity)
        ? previous.filter((item) => item !== amenity)
        : [...previous, amenity]
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Host Your Space
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
            Add a New Studio
          </h1>

          <p className="mt-3 text-gray-600">
            Share your creative space with photographers, filmmakers,
            podcasters, and other creators.
          </p>
        </div>

        {/* Studio Form */}
        <form className="space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">

          {/* Basic Information */}
          <section>
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* Studio Title */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Studio Title *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Creative Photography Studio"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Studio Category *
                </label>

                <select
                  id="category"
                  name="category"
                  required
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="" disabled>
                    Select a category
                  </option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Capacity */}
              <div>
                <label
                  htmlFor="maxCapacity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Maximum Capacity *
                </label>

                <input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

            </div>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900">
              Pricing & Deposit
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="hourlyRate"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Hourly Rate (AED) *
                </label>

                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="securityDeposit"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Security Deposit (AED) *
                </label>

                <input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  min="0"
                  placeholder="e.g. 300"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900">
              Location
            </h2>

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Studio Address *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Al Mizhar, Dubai, UAE"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </section>

          {/* Image */}
          <section>
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900">
              Studio Image
            </h2>

            <div>
              <label
                htmlFor="imageUrl"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Image URL *
              </label>

              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/studio-image.jpg"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter an image URL. We will add image-hosting integration
                in a later step.
              </p>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Amenities
            </h2>

            <p className="mb-5 text-sm text-gray-500">
              Select all facilities available in your studio.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 accent-orange-600"
                  />

                  <span className="text-sm text-gray-700">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900">
              Studio Overview
            </h2>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Detailed Description *
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                minLength={20}
                placeholder="Describe your studio, equipment, facilities, and what makes it special..."
                required
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </section>

          {/* Host Information */}
          <section>
            <h2 className="mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900">
              Host Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label
                  htmlFor="ownerName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Host Name
                </label>

                <input
                  id="ownerName"
                  name="ownerName"
                  type="text"
                  placeholder="Available after login integration"
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="ownerEmail"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Host Email
                </label>

                <input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  placeholder="Available after login integration"
                  readOnly
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 outline-none"
                />
              </div>

            </div>

            <p className="mt-3 text-xs text-gray-500">
              Host details will be filled from the authenticated user's
              account when authentication is connected.
            </p>
          </section>

          {/* Submit */}
          <div className="border-t border-gray-100 pt-6">
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-orange-600 px-6 py-3.5 font-semibold text-white opacity-70 sm:w-auto"
            >
              Submit Integration Coming Next
            </button>

            <p className="mt-3 text-sm text-gray-500">
              This is the UI step. Database submission will be connected next.
            </p>
          </div>

        </form>
      </div>
    </main>
  );
}