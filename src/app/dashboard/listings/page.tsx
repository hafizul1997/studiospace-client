
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  MapPin,
  Users,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Studio = {
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
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
};

type EditForm = {
  title: string;
  category: string;
  hourlyRate: string;
  securityDeposit: string;
  maxCapacity: string;
  location: string;
  imageUrl: string;
  description: string;
};

const initialForm: EditForm = {
  title: "",
  category: "Photo Studio",
  hourlyRate: "",
  securityDeposit: "",
  maxCapacity: "",
  location: "",
  imageUrl: "",
  description: "",
};

const categories = [
  "Photo Studio",
  "Film Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
];

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-900/40";

const labelClasses =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function MyListingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const userEmail = session?.user?.email;

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(initialForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch owner's studios
  const fetchMyListings = useCallback(
    async (signal?: AbortSignal) => {
      if (!userEmail) {
        setStudios([]);
        setLoading(false);
        return;
      }

      try {
        setLoadError("");

        const response = await fetch("/api/backend/my-listings", {
          method: "GET",
          cache: "no-store",
          signal,
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              `Failed to fetch listings. Status: ${response.status}`
          );
        }

        if (!Array.isArray(result)) {
          throw new Error("Invalid listing data received from server.");
        }

        setStudios(result);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Fetch listings error:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Could not load your listings";

        setLoadError(message);
        toast.error(message);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [userEmail]
  );

  // Load listings when session is ready
  useEffect(() => {
    if (isPending || !userEmail) return;

    const controller = new AbortController();

    const loadListings = async () => {
      await fetchMyListings(controller.signal);
    };

    void loadListings();

    return () => {
      controller.abort();
    };
  }, [isPending, userEmail, fetchMyListings]);

  // Search and category filter
  const filteredStudios = useMemo(() => {
    return studios.filter((studio) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        studio.title?.toLowerCase().includes(searchText) ||
        studio.location?.toLowerCase().includes(searchText) ||
        studio.category?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All" || studio.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [studios, search, category]);

  // Open Edit Modal
  const handleEdit = (studio: Studio) => {
    setEditingStudio(studio);

    setEditForm({
      title: studio.title || "",
      category: studio.category || "Photo Studio",
      hourlyRate: String(studio.hourlyRate ?? ""),
      securityDeposit: String(studio.securityDeposit ?? ""),
      maxCapacity: String(studio.maxCapacity ?? ""),
      location: studio.location || "",
      imageUrl: studio.imageUrl || "",
      description: studio.description || "",
    });
  };

  // Update form fields
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save updated studio
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingStudio || !userEmail) {
      toast.error("Please log in first.");
      return;
    }

    const hourlyRate = Number(editForm.hourlyRate);
    const securityDeposit = Number(editForm.securityDeposit);
    const maxCapacity = Number(editForm.maxCapacity);

    if (
      !editForm.title.trim() ||
      !editForm.location.trim() ||
      !Number.isFinite(hourlyRate) ||
      hourlyRate <= 0 ||
      !Number.isFinite(securityDeposit) ||
      securityDeposit < 0 ||
      !Number.isInteger(maxCapacity) ||
      maxCapacity < 1
    ) {
      toast.error("Please enter valid studio information.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/backend/studios/${encodeURIComponent(editingStudio._id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editForm,
            title: editForm.title.trim(),
            location: editForm.location.trim(),
            hourlyRate,
            securityDeposit,
            maxCapacity,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to update studio. Status: ${response.status}`
        );
      }

      setStudios((previous) =>
        previous.map((studio) =>
          studio._id === editingStudio._id
            ? {
                ...studio,
                ...editForm,
                title: editForm.title.trim(),
                location: editForm.location.trim(),
                hourlyRate,
                securityDeposit,
                maxCapacity,
              }
            : studio
        )
      );

      toast.success("Studio updated successfully!");
      setEditingStudio(null);
    } catch (error) {
      console.error("Update studio error:", error);

      toast.error(
        error instanceof Error ? error.message : "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete studio
  const handleDelete = async (studio: Studio) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${studio.title}"?`
    );

    if (!confirmed || !userEmail) return;

    try {
      setDeletingId(studio._id);

      const response = await fetch(
        `/api/backend/studios/${encodeURIComponent(studio._id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to delete studio. Status: ${response.status}`
        );
      }

      setStudios((previous) =>
        previous.filter((item) => item._id !== studio._id)
      );

      toast.success("Studio deleted successfully!");
    } catch (error) {
      console.error("Delete studio error:", error);

      toast.error(
        error instanceof Error ? error.message : "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Session loading
  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-300">
        Checking your account...
      </div>
    );
  }

  // Login check
  if (!session?.user || !userEmail) {
    return (
      <div className="bg-gray-50 p-8 text-center dark:bg-gray-950">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Please log in
        </h2>

        <Link
          href="/login"
          className="mt-3 inline-block text-blue-600 hover:underline dark:text-blue-400"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 text-gray-600 dark:bg-gray-950 dark:text-gray-300">
        Loading your listings...
      </div>
    );
  }

  // Fetch error
  if (loadError && studios.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center dark:bg-gray-950">
        <p className="text-red-600 dark:text-red-400">{loadError}</p>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            fetchMyListings();
          }}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-white transition hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 bg-gray-50 p-4 dark:bg-gray-950 md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Listings
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the studios you have added.
          </p>
        </div>

        <Link
          href="/add-studio"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
        >
          <Plus size={18} />
          Add New Studio
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />

          <input
            type="text"
            placeholder="Search by title, location or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search studios"
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-900/40"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-900/40"
        >
          <option value="All">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {filteredStudios.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {studios.length}
        </span>{" "}
        studios
      </p>

      {/* Studio Cards */}
      {filteredStudios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {studios.length === 0
              ? "You haven't added any studios yet."
              : "No matching studios found."}
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {studios.length === 0
              ? "Add your first studio to get started."
              : "Try another search term or category."}
          </p>

          {studios.length === 0 && (
            <Link
              href="/add-studio"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            >
              <Plus size={17} />
              Add Studio
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudios.map((studio) => (
            <div
              key={studio._id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
                {studio.imageUrl ? (
                  <Image
                    src={studio.imageUrl}
                    alt={studio.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 dark:text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 dark:text-white">
                      {studio.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {studio.category}
                    </p>
                  </div>

                  <span className="whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    AED {studio.hourlyRate}/hr
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin
                      size={15}
                      className="shrink-0 text-green-600 dark:text-green-400"
                    />
                    {studio.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users
                      size={15}
                      className="shrink-0 text-green-600 dark:text-green-400"
                    />
                    {studio.maxCapacity} people
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {studio.description}
                </p>

                <Link
                  href={`/studios/${studio._id}`}
                  className="block rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  View Details
                </Link>

                {/* Edit and Delete Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(studio)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/60"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(studio)}
                    disabled={deletingId === studio._id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    <Trash2 size={16} />
                    {deletingId === studio._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Studio Modal */}
      {editingStudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-studio-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="edit-studio-title"
                  className="text-xl font-bold text-gray-900 dark:text-white"
                >
                  Edit Studio
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your studio information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingStudio(null)}
                disabled={saving}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Close edit form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className={labelClasses}>
                  Studio Title
                </label>

                <input
                  id="edit-title"
                  name="title"
                  value={editForm.title}
                  onChange={handleFormChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="edit-category" className={labelClasses}>
                  Category
                </label>

                <select
                  id="edit-category"
                  name="category"
                  value={editForm.category}
                  onChange={handleFormChange}
                  className={inputClasses}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="edit-hourlyRate" className={labelClasses}>
                    Hourly Rate (AED)
                  </label>

                  <input
                    id="edit-hourlyRate"
                    type="number"
                    name="hourlyRate"
                    min="0.01"
                    step="0.01"
                    value={editForm.hourlyRate}
                    onChange={handleFormChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-securityDeposit"
                    className={labelClasses}
                  >
                    Security Deposit
                  </label>

                  <input
                    id="edit-securityDeposit"
                    type="number"
                    name="securityDeposit"
                    min="0"
                    step="0.01"
                    value={editForm.securityDeposit}
                    onChange={handleFormChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label htmlFor="edit-maxCapacity" className={labelClasses}>
                    Max Capacity
                  </label>

                  <input
                    id="edit-maxCapacity"
                    type="number"
                    name="maxCapacity"
                    min="1"
                    step="1"
                    value={editForm.maxCapacity}
                    onChange={handleFormChange}
                    required
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-location" className={labelClasses}>
                  Location
                </label>

                <input
                  id="edit-location"
                  name="location"
                  value={editForm.location}
                  onChange={handleFormChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="edit-imageUrl" className={labelClasses}>
                  Image URL
                </label>

                <input
                  id="edit-imageUrl"
                  type="url"
                  name="imageUrl"
                  value={editForm.imageUrl}
                  onChange={handleFormChange}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="edit-description" className={labelClasses}>
                  Description
                </label>

                <textarea
                  id="edit-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  rows={4}
                  className={`${inputClasses} resize-y`}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-gray-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingStudio(null)}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
