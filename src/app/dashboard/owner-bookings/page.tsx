
"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OwnerBookingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const ownerEmail = session?.user?.email?.toLowerCase() || "";

  // Fetch Owner Bookings
  const fetchOwnerBookings = useCallback(
    async (signal?: AbortSignal) => {
      if (!ownerEmail) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/owner-bookings`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              `Failed to load booking requests. Status: ${response.status}`
          );
        }

        if (!Array.isArray(result)) {
          throw new Error("Invalid booking data received from server.");
        }

        setBookings(result);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
          console.error("Owner bookings fetch error:", err);
          setError(err.message);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [ownerEmail]
  );

  // Load Owner Bookings
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

  // Confirm or Reject Booking
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
        `${API_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `Could not ${action} booking.`
        );
      }

      // Update booking status in the UI
      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status }
            : booking
        )
      );
    } catch (err) {
      console.error("Booking status update error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Authentication Loading
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

  // User Not Logged In
  if (!ownerEmail) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Login Required
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Please login to view your booking requests.
        </p>
      </div>
    );
  }

  // Booking Loading
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

  // API Error
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <h2 className="font-semibold">
          Unable to Load Booking Requests
        </h2>

        <p className="mt-2 text-sm">{error}</p>

        <button
          onClick={() => fetchOwnerBookings()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  const pendingCount = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Booking Requests
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage booking requests received for your studios.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Bookings
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {bookings.length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">
            Pending Requests
          </p>

          <p className="mt-2 text-3xl font-bold text-orange-500">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Booking List */}
      {bookings.length === 0 ? (
        <div className="rounded-xl border bg-white px-6 py-16 text-center">
          <ClipboardList
            size={45}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            No Booking Requests Yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            When customers book your studios, their requests
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              {/* Studio and Status */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {booking.studioTitle}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Booking ID: {booking._id}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    booking.status === "Pending"
                      ? "bg-orange-100 text-orange-700"
                      : booking.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Customer Information */}
              <div className="py-4">
                <p className="text-sm font-semibold text-gray-800">
                  Customer Information
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  Name: {booking.customerName}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Email: {booking.customerEmail}
                </p>
              </div>

              {/* Booking Details */}
              <div className="grid gap-4 border-t py-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays
                    size={18}
                    className="text-green-600"
                  />
                  {booking.bookingDate}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock
                    size={18}
                    className="text-green-600"
                  />
                  {booking.startTime} - {booking.endTime}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users
                    size={18}
                    className="text-green-600"
                  />
                  {booking.guests} Guests
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Price ({booking.totalHours} hours)
                  </p>

                  <p className="mt-1 text-xl font-bold text-green-700">
                    AED {booking.totalPrice}
                  </p>
                </div>

                {/* Confirm and Reject */}
                {booking.status === "Pending" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        handleBookingStatus(
                          booking._id,
                          "Confirmed"
                        )
                      }
                      disabled={updatingId !== null}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                      onClick={() =>
                        handleBookingStatus(
                          booking._id,
                          "Rejected"
                        )
                      }
                      disabled={updatingId !== null}
                      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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
