
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
  const router = useRouter();

  // Authentication
  const { data: session, isPending } = authClient.useSession();

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Protect Add Studio page
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  // Handle amenity selection
  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((previous) =>
      previous.includes(amenity)
        ? previous.filter((item) => item !== amenity)
        : [...previous, amenity]
    );
  };

  // Handle form submission
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!session?.user) {
      toast.error("Please login to add a studio.");
      router.replace("/login");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const hourlyRate = Number(formData.get("hourlyRate"));
    const securityDeposit = Number(formData.get("securityDeposit"));
    const maxCapacity = Number(formData.get("maxCapacity"));
    const location = String(formData.get("location") ?? "").trim();
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    // Frontend validation
    if (
      !title ||
      !category ||
      !location ||
      !imageUrl ||
      !description
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!categories.includes(category)) {
      toast.error("Please select a valid studio category.");
      return;
    }

    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      toast.error("Hourly rate must be greater than 0.");
      return;
    }

    if (!Number.isFinite(securityDeposit) || securityDeposit < 0) {
      toast.error("Security deposit cannot be negative.");
      return;
    }

    if (
      !Number.isInteger(maxCapacity) ||
      maxCapacity < 1
    ) {
      toast.error("Maximum capacity must be at least 1.");
      return;
    }

    if (description.length < 20) {
      toast.error("Description must contain at least 20 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      const studioData = {
        title,
        category,
        hourlyRate,
        securityDeposit,
        maxCapacity,
        location,
        imageUrl,
        amenities: selectedAmenities,
        description,

        // Informational fields only.
        // Backend must use authenticated session for ownership.
        ownerName: session.user.name || "",
        ownerEmail: session.user.email.toLowerCase(),
      };

      const response = await fetch(`${API_URL}/api/studios`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studioData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Failed to create studio. Status: ${response.status}`
        );
      }

      toast.success("Studio added successfully!");

      form.reset();
      setSelectedAmenities([]);

      router.push("/dashboard/listings");
    } catch (error) {
      console.error("Add Studio Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Authentication loading
  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  // Redirect if user is not logged in
  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">
          Redirecting to login...
        </p>
      </div>
    );
  }

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
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8"
        >

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
                  step="1"
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
                  step="0.01"
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
                  step="0.01"
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
                  type="text"
                  value={session.user.name || ""}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
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
                  type="email"
                  value={session.user.email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Your host information is automatically taken from your account.
            </p>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-orange-600 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? "Adding Studio..." : "Add Studio"}
          </button>

        </form>
      </div>
    </main>
  );
}
