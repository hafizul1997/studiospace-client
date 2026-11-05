
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

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

  const { data: session, isPending } = authClient.useSession();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/login");
    }
  }, [isPending, session, router]);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((previous) =>
      previous.includes(amenity)
        ? previous.filter((item) => item !== amenity)
        : [...previous, amenity]
    );
  };

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

    if (!title || !category || !location || !imageUrl || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (title.length > 120) {
      toast.error("Studio title cannot exceed 120 characters.");
      return;
    }

    if (!categories.includes(category)) {
      toast.error("Please select a valid studio category.");
      return;
    }

    if (
      !Number.isFinite(hourlyRate) ||
      hourlyRate <= 0 ||
      hourlyRate > 1000000
    ) {
      toast.error("Please enter a valid hourly rate.");
      return;
    }

    if (
      !Number.isFinite(securityDeposit) ||
      securityDeposit < 0 ||
      securityDeposit > 10000000
    ) {
      toast.error("Please enter a valid security deposit.");
      return;
    }

    if (
      !Number.isInteger(maxCapacity) ||
      maxCapacity < 1 ||
      maxCapacity > 10000
    ) {
      toast.error("Maximum capacity must be between 1 and 10000.");
      return;
    }

    if (location.length > 200) {
      toast.error("Location cannot exceed 200 characters.");
      return;
    }

    try {
      const parsedImageUrl = new URL(imageUrl);

      if (
        !["http:", "https:"].includes(parsedImageUrl.protocol) ||
        imageUrl.length > 2048
      ) {
        toast.error("Please enter a valid image URL.");
        return;
      }
    } catch {
      toast.error("Please enter a valid image URL.");
      return;
    }

    if (selectedAmenities.length > 30) {
      toast.error("You can select up to 30 amenities.");
      return;
    }

    if (description.length < 20 || description.length > 3000) {
      toast.error("Description must contain 20 to 3000 characters.");
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
      };

      const response = await fetch("/api/backend/studios", {
        method: "POST",
        credentials: "same-origin",
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

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-orange-500 dark:focus:ring-orange-900/40";

  const labelClasses =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

  const sectionHeadingClasses =
    "mb-5 border-b border-gray-100 pb-3 text-xl font-semibold text-gray-900 dark:border-gray-700 dark:text-white";

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-300">
          Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            Host Your Space
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Add a New Studio
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Share your creative space with photographers, filmmakers,
            podcasters, and other creators.
          </p>
        </div>

        {/* Studio Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          {/* Basic Information */}
          <section>
            <h2 className={sectionHeadingClasses}>
              Basic Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className={labelClasses}>
                  Studio Title *
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Creative Photography Studio"
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="category" className={labelClasses}>
                  Studio Category *
                </label>

                <select
                  id="category"
                  name="category"
                  required
                  defaultValue=""
                  className={inputClasses}
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

              <div>
                <label htmlFor="maxCapacity" className={labelClasses}>
                  Maximum Capacity *
                </label>

                <input
                  id="maxCapacity"
                  name="maxCapacity"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  placeholder="e.g. 10"
                  required
                  className={inputClasses}
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h2 className={sectionHeadingClasses}>
              Pricing & Deposit
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="hourlyRate" className={labelClasses}>
                  Hourly Rate (AED) *
                </label>

                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="1"
                  max="1000000"
                  step="0.01"
                  placeholder="e.g. 150"
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label
                  htmlFor="securityDeposit"
                  className={labelClasses}
                >
                  Security Deposit (AED) *
                </label>

                <input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  placeholder="e.g. 300"
                  required
                  className={inputClasses}
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className={sectionHeadingClasses}>Location</h2>

            <div>
              <label htmlFor="location" className={labelClasses}>
                Studio Address *
              </label>

              <input
                id="location"
                name="location"
                type="text"
                maxLength={200}
                placeholder="e.g. Al Mizhar, Dubai, UAE"
                required
                className={inputClasses}
              />
            </div>
          </section>

          {/* Image */}
          <section>
            <h2 className={sectionHeadingClasses}>Studio Image</h2>

            <div>
              <label htmlFor="imageUrl" className={labelClasses}>
                Image URL *
              </label>

              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                maxLength={2048}
                placeholder="https://example.com/studio-image.jpg"
                required
                className={inputClasses}
              />

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter an image URL. We will add image-hosting integration
                in a later step.
              </p>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Amenities
            </h2>

            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Select all facilities available in your studio.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {availableAmenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-700 dark:hover:bg-orange-950/30"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 accent-orange-600"
                  />

                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className={sectionHeadingClasses}>
              Studio Overview
            </h2>

            <div>
              <label htmlFor="description" className={labelClasses}>
                Detailed Description *
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                minLength={20}
                maxLength={3000}
                placeholder="Describe your studio, equipment, facilities, and what makes it special..."
                required
                className={`${inputClasses} resize-y`}
              />
            </div>
          </section>

          {/* Host Information */}
          <section>
            <h2 className={sectionHeadingClasses}>
              Host Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ownerName" className={labelClasses}>
                  Host Name
                </label>

                <input
                  id="ownerName"
                  type="text"
                  value={session.user.name || ""}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>

              <div>
                <label htmlFor="ownerEmail" className={labelClasses}>
                  Host Email
                </label>

                <input
                  id="ownerEmail"
                  type="email"
                  value={session.user.email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
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
