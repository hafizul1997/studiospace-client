
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Loader2,
  AlertCircle,
  ClipboardList,
  ArrowRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";

interface Booking {
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
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Safely read JSON response
const readJsonResponse = async (response: Response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Server returned an invalid response. Please check that your backend is running."
    );
  }
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Fetch bookings using authenticated session
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/api/my-bookings`, {
        method: "GET",
        credentials: "include",
      });

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch bookings."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid response received from server.");
      }

      setBookings(data);
      setSearched(true);
    } catch (err) {
      console.error("Fetch bookings error:", err);

      setBookings([]);
      setSearched(true);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatically load bookings when page opens
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // Cancel booking using authenticated session
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setCancellingId(selectedBooking._id);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/bookings/${selectedBooking._id}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Could not cancel this booking."
        );
      }

      setSelectedBooking(null);

      await fetchBookings();

      setSuccess("Your booking has been cancelled successfully.");
    } catch (err) {
      console.error("Cancel booking error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Status styles
  const getStatusStyle = (status: Booking["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Completed":
        return "bg-blue-100 text-blue-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Page Heading */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Your Reservations
          </p>

          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            My Bookings
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            View your studio reservations, check their status, and manage your
            bookings.
          </p>
        </div>

        {/* Booking Information */}
        <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Your Reservations
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your bookings are connected to your logged-in account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchBookings()}
              disabled={loading}
              className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Refresh Bookings
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}
        </section>

        {/* Booking Summary */}
        {searched && !loading && !error && bookings.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {bookings.length}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {confirmedCount}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500">
              Finding your reservations...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && searched && !error && bookings.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-gray-400" />

            <h3 className="text-xl font-semibold text-gray-900">
              No bookings found
            </h3>

            <p className="mt-2 text-gray-500">
              You do not have any studio reservations yet.
            </p>

            <Link
              href="/studios"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Explore Studios
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Booking List */}
        {!loading && !error && bookings.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">
              Your Reservations ({bookings.length})
            </h2>

            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md md:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {booking.studioTitle}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Booking ID: {booking._id}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-1.5 text-sm font-semibold ${getStatusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="my-5 grid grid-cols-1 gap-4 border-y border-gray-100 py-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Booking Date
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(booking.bookingDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Booking Time
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatTime(booking.startTime)} -{" "}
                        {formatTime(booking.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Guests
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {booking.guests} People
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">
                        Duration
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {booking.totalHours} Hours
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Price
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      AED {booking.totalPrice}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/studios/${booking.studioId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-5 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      View Studio
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    {booking.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        disabled={cancellingId === booking._id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            if (!cancellingId) setSelectedBooking(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>

            <h2
              id="cancel-title"
              className="text-xl font-bold text-gray-900"
            >
              Cancel this booking?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to cancel your booking for{" "}
              <span className="font-semibold text-gray-800">
                {selectedBooking.studioTitle}
              </span>
              ? This action will change the booking status to Cancelled.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                disabled={cancellingId !== null}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={handleCancelBooking}
                disabled={cancellingId !== null}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancellingId === selectedBooking._id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
