
"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function MyListingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch owner's studios
  useEffect(() => {
    if (isPending || !session?.user?.email) return;

    let ignore = false;

    const fetchMyListings = async () => {
      try {
        const email = encodeURIComponent(session.user.email);

        const response = await fetch(
          `http://localhost:5000/api/my-listings?email=${email}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }

        const data: Studio[] = await response.json();

        if (!ignore) {
          setStudios(data);
        }
      } catch (error) {
        console.error(error);

        if (!ignore) {
          toast.error("Could not load your listings");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchMyListings();

    return () => {
      ignore = true;
    };
  }, [session, isPending]);

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

    if (!editingStudio || !session?.user?.email) return;

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
      toast.error("Please enter valid studio information");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:5000/api/studios/${editingStudio._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editForm,
            hourlyRate,
            securityDeposit,
            maxCapacity,
            ownerEmail: session.user.email.toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update studio");
      }

      // Update UI without refreshing
      setStudios((previous) =>
        previous.map((studio) =>
          studio._id === editingStudio._id
            ? {
                ...studio,
                ...editForm,
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
      console.error(error);

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

    if (!confirmed || !session?.user?.email) return;

    try {
      setDeletingId(studio._id);

      const response = await fetch(
        `http://localhost:5000/api/studios/${studio._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ownerEmail: session.user.email.toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete studio");
      }

      setStudios((previous) =>
        previous.filter((item) => item._id !== studio._id)
      );

      toast.success("Studio deleted successfully!");
    } catch (error) {
      console.error(error);

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
      <div className="flex min-h-[50vh] items-center justify-center">
        Checking your account...
      </div>
    );
  }

  // Login check
  if (!session?.user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Please log in</h2>
        <Link href="/login" className="mt-3 inline-block text-blue-600">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        Loading your listings...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the studios you have added.
          </p>
        </div>

        <Link
          href="/add-studio"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by title, location or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-black"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
        >
          <option value="All">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredStudios.length} of {studios.length} studios
      </p>

      {/* Studio Cards */}
      {filteredStudios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            {studios.length === 0
              ? "You haven't added any studios yet."
              : "No matching studios found."}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {studios.length === 0
              ? "Add your first studio to get started."
              : "Try another search term or category."}
          </p>

          {studios.length === 0 && (
            <Link
              href="/add-studio"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white"
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
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative h-48 w-full bg-gray-100">
                {studio.imageUrl ? (
                  <Image
                    src={studio.imageUrl}
                    alt={studio.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {studio.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {studio.category}
                    </p>
                  </div>

                  <span className="whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-sm font-semibold">
                    AED {studio.hourlyRate}/hr
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={15} />
                    {studio.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Users size={15} />
                    {studio.maxCapacity} people
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-gray-600">
                  {studio.description}
                </p>

                <Link
                  href={`/studios/${studio._id}`}
                  className="block rounded-lg border border-gray-300 py-2 text-center text-sm font-medium hover:bg-gray-50"
                >
                  View Details
                </Link>

                {/* Edit and Delete Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handleEdit(studio)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(studio)}
                    disabled={deletingId === studio._id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deletingId === studio._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Studio Modal */}
      {editingStudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Studio
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Update your studio information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingStudio(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close edit form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Studio Title
                </label>
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Category
                </label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-black"
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
                  <label className="mb-1 block text-sm font-medium">
                    Hourly Rate (AED)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    min="0.01"
                    step="0.01"
                    value={editForm.hourlyRate}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    name="securityDeposit"
                    min="0"
                    step="0.01"
                    value={editForm.securityDeposit}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    name="maxCapacity"
                    min="1"
                    step="1"
                    value={editForm.maxCapacity}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Location
                </label>
                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={editForm.imageUrl}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingStudio(null)}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
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
