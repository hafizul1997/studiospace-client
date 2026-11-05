
"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardList,
} from "lucide-react";

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
  status: "Pending" | "Confirmed" | "Rejected" | "Cancelled";
};

export default function OwnerBookingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const ownerEmail = session?.user?.email?.toLowerCase() || "";

  const fetchOwnerBookings = useCallback(
    async (signal?: AbortSignal) => {
      if (!ownerEmail) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/backend/owner-bookings", {
          method: "GET",
          cache: "no-store",
          signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Failed to load booking requests. Status: ${response.status}`
          );
        }

        const bookingData = Array.isArray(data)
          ? data
          : data.bookings;

        if (!Array.isArray(bookingData)) {
          throw new Error("Invalid booking data received from server.");
        }

        setBookings(bookingData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Owner bookings fetch error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [ownerEmail]
  );

  useEffect(() => {
    if (isPending || !ownerEmail) return;

    const controller = new AbortController();

    const initialTimer = setTimeout(() => {
      fetchOwnerBookings(controller.signal);
    }, 0);

    return () => {
      clearTimeout(initialTimer);
      controller.abort();
    };
  }, [ownerEmail, isPending, fetchOwnerBookings]);

  const handleBookingStatus = async (
    bookingId: string,
    status: "Confirmed" | "Rejected"
  ) => {
    if (!ownerEmail || updatingId) return;

    const action = status === "Confirmed" ? "confirm" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this booking?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(bookingId);

      const response = await fetch(
        `/api/backend/bookings/${encodeURIComponent(bookingId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Could not ${action} booking.`
        );
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status }
            : booking
        )
      );

      toast.success(
        status === "Confirmed"
          ? "Booking confirmed successfully!"
          : "Booking rejected successfully!"
      );
    } catch (err) {
      console.error("Booking status update error:", err);

      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const statusClasses = (status: Booking["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400";
      case "Confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400";
      case "Rejected":
        return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="animate-spin text-green-600"
          size={35}
        />
      </div>
    );
  }

  if (!ownerEmail) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Login Required
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please login to view your booking requests.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2
          className="animate-spin text-green-600"
          size={35}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
        <h2 className="font-semibold">
          Unable to Load Booking Requests
        </h2>

        <p className="mt-2 text-sm">{error}</p>

        <button
          type="button"
          onClick={() => fetchOwnerBookings()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Booking Requests
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage booking requests received for your studios.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {bookings.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending Requests
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500 dark:text-orange-400">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Booking List */}
      {bookings.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <ClipboardList
            size={45}
            className="mx-auto text-gray-300 dark:text-gray-600"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">
            No Booking Requests Yet
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            When customers book your studios, their requests
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Studio and Status */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
                <div className="min-w-0">
                  <h2 className="wrap-break-word text-lg font-bold text-gray-900 dark:text-white">
                    {booking.studioTitle}
                  </h2>

                  <p className="mt-1 break-all text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Booking ID: {booking._id}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Customer Information */}
              <div className="py-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Customer Information
                </p>

                <p className="mt-2 wrap-break-word text-sm text-gray-600 dark:text-gray-400">
                  Name: {booking.customerName}
                </p>

                <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-400">
                  Email: {booking.customerEmail}
                </p>
              </div>

              {/* Booking Details */}
              <div className="grid gap-4 border-t border-gray-200 py-4 dark:border-gray-800 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CalendarDays
                    size={18}
                    className="shrink-0 text-green-600 dark:text-green-500"
                  />
                  {booking.bookingDate}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock
                    size={18}
                    className="shrink-0 text-green-600 dark:text-green-500"
                  />
                  {booking.startTime} - {booking.endTime}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Users
                    size={18}
                    className="shrink-0 text-green-600 dark:text-green-500"
                  />
                  {booking.guests} Guests
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total Price ({booking.totalHours} hours)
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-700 dark:text-green-400">
                    AED {booking.totalPrice}
                  </p>
                </div>

                {/* Confirm and Reject */}
                {booking.status === "Pending" && (
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() =>
                        handleBookingStatus(
                          booking._id,
                          "Confirmed"
                        )
                      }
                      disabled={updatingId !== null}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:flex-none"
                    >
                      {updatingId === booking._id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}

                      Confirm
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleBookingStatus(
                          booking._id,
                          "Rejected"
                        )
                      }
                      disabled={updatingId !== null}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 sm:flex-none"
                    >
                      {updatingId === booking._id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <XCircle size={16} />
                      )}

                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
