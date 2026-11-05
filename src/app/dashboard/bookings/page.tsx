
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Search,
  CalendarDays,
  Clock,
  Users,
  MapPin,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type Booking = {
  _id: string;
  studioId: string;
  studioTitle: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guests: number;
  totalHours: number;
  hourlyRate: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Cancelled" | "Rejected";
  createdAt: string;
};

export default function MyBookingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const userEmail = session?.user?.email?.toLowerCase() || "";

  // Fetch current user's bookings
  const fetchMyBookings = useCallback(
    async (signal?: AbortSignal) => {
      if (!userEmail) return;

      try {
        setError("");

        const response = await fetch("/api/backend/my-bookings", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal,
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              `Failed to fetch bookings. Status: ${response.status}`
          );
        }

        if (!Array.isArray(result)) {
          throw new Error("Invalid booking data received from server.");
        }

        setBookings(result);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("My bookings error:", error);
          setError(error.message);
          toast.error("Could not load your bookings");
        }
      }
    },
    [userEmail]
  );

  // Load bookings when session is ready
  useEffect(() => {
    if (isPending || !userEmail) return;

    const controller = new AbortController();

    const timer = setTimeout(() => {
      void fetchMyBookings(controller.signal);
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isPending, userEmail, fetchMyBookings]);

  // Search and status filter
  const filteredBookings = useMemo(() => {
    return (bookings ?? []).filter((booking) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        booking.studioTitle?.toLowerCase().includes(searchText) ||
        booking.bookingDate?.includes(searchText) ||
        booking.status?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  // Cancel booking
  const handleCancelBooking = async (booking: Booking) => {
    if (!userEmail || cancellingId) return;

    if (booking.status !== "Pending") {
      toast.error("Only pending bookings can be cancelled");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel your booking for "${booking.studioTitle}"?`
    );

    if (!confirmed) return;

    try {
      setCancellingId(booking._id);

      const response = await fetch(
        `/api/backend/bookings/${encodeURIComponent(booking._id)}/cancel`,
        {
          method: "PATCH",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel booking");
      }

      setBookings((previous) =>
        (previous ?? []).map((item) =>
          item._id === booking._id
            ? { ...item, status: "Cancelled" }
            : item
        )
      );

      toast.success(result.message || "Booking cancelled successfully!");
    } catch (error) {
      console.error("Cancel booking error:", error);

      toast.error(
        error instanceof Error ? error.message : "Cancellation failed"
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Session loading
  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2
          className="animate-spin text-gray-500 dark:text-gray-400"
          size={30}
        />
      </div>
    );
  }

  // Login check
  if (!session?.user) {
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

  // Bookings loading
  if (bookings === null && !error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2
          className="animate-spin text-gray-500 dark:text-gray-400"
          size={30}
        />
      </div>
    );
  }

  // API Error
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
        <h2 className="font-semibold">Unable to Load Your Bookings</h2>

        <p className="mt-2 text-sm">{error}</p>

        <button
          type="button"
          onClick={() => {
            setBookings(null);
            void fetchMyBookings();
          }}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const currentBookings = bookings ?? [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400";
      case "Cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
      case "Rejected":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400";
    }
  };

  return (
    <div className="min-h-full space-y-6 bg-gray-50 p-4 dark:bg-gray-950 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Bookings
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage your studio booking requests.
        </p>
      </div>

      {/* Booking Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Bookings
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {currentBookings.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending
          </p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {currentBookings.filter((b) => b.status === "Pending").length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Confirmed
          </p>
          <h2 className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {currentBookings.filter((b) => b.status === "Confirmed").length}
          </h2>
        </div>
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
            placeholder="Search by studio name or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search bookings"
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-900/40"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter bookings by status"
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-green-500 dark:focus:ring-green-900/40"
        >
          <option value="All">All Bookings</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {filteredBookings.length}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {currentBookings.length}
        </span>{" "}
        bookings
      </p>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center dark:border-gray-700 dark:bg-gray-900">
          <CalendarDays
            size={40}
            className="mx-auto text-gray-400 dark:text-gray-500"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            {currentBookings.length === 0
              ? "You haven't made any bookings yet."
              : "No matching bookings found."}
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {currentBookings.length === 0
              ? "Explore studios and make your first booking."
              : "Try another search or status filter."}
          </p>

          {currentBookings.length === 0 && (
            <Link
              href="/studios"
              className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Explore Studios
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
            >
              {/* Booking Header */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {booking.studioTitle}
                  </h2>

                  <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                    Booking ID: {booking._id}
                  </p>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Booking Information */}
              <div className="mt-5 grid gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/60 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <CalendarDays
                    size={19}
                    className="shrink-0 text-green-600 dark:text-green-400"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Booking Date
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {booking.bookingDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock
                    size={19}
                    className="shrink-0 text-green-600 dark:text-green-400"
                  />

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Time
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users
                    size={19}
                    className="shrink-0 text-green-600 dark:text-green-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Guests
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {booking.guests} people
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin
                    size={19}
                    className="shrink-0 text-green-600 dark:text-green-400"
                  />

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Duration
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {booking.totalHours} hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="mt-5 flex flex-col justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Booking Price
                  </p>

                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    AED {Number(booking.totalPrice).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/studios/${booking.studioId}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    View Studio
                  </Link>

                  {booking.status === "Pending" && (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(booking)}
                      disabled={cancellingId === booking._id}
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      {cancellingId === booking._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <XCircle size={16} />
                      )}

                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel Booking"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
