
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  MapPin,
  CreditCard,
  XCircle,
  CheckCircle2,
  Hourglass,
  RefreshCw,
  AlertCircle,
  CalendarCheck,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface Booking {
  _id: string;
  status?: string;
  studioName?: string;
  name?: string;
  studioImage?: string;
  image?: string;
  location?: string;
  date?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  totalPrice?: number;
  paymentStatus?: string;
  [key: string]: unknown;
}

const getStatus = (status?: string) =>
  (status || "Pending").toLowerCase();

const statusStyles: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  confirmed:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  cancelled:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  rejected:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
  completed:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/backend/my-bookings", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load bookings.");
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.bookings)
          ? data.bookings
          : [];

      setBookings(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadBookings();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadBookings]);

  // Cancel Booking with Sonner Toast Notification
  const cancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);

      const response = await fetch(
        `/api/backend/bookings/${encodeURIComponent(
          selectedBooking._id
        )}/cancel`,
        {
          method: "PATCH",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel booking.");
      }

      toast.success("Booking cancelled successfully!");

      setSelectedBooking(null);
      await loadBookings();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while cancelling booking."
      );
    } finally {
      setCancelling(false);
    }
  };

  const pending = bookings.filter(
    (b) => getStatus(b.status) === "pending"
  ).length;

  const confirmed = bookings.filter(
    (b) => getStatus(b.status) === "confirmed"
  ).length;

  const cancelled = bookings.filter((b) =>
    ["cancelled", "rejected"].includes(getStatus(b.status))
  ).length;

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => getStatus(b.status) === filter);

  const formatDate = (value?: string) => {
    if (!value) return "Date not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStudioName = (booking: Booking) =>
    booking.studioName || booking.name || "Studio Booking";

  const getPrice = (booking: Booking) =>
    booking.totalPrice ?? booking.price;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 transition-colors sm:px-6 lg:px-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Customer Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              My Bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Manage your studio reservations in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadBookings()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Bookings",
              value: bookings.length,
              icon: CalendarDays,
              color:
                "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400",
            },
            {
              label: "Pending",
              value: pending,
              icon: Hourglass,
              color:
                "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
            },
            {
              label: "Confirmed",
              value: confirmed,
              icon: CheckCircle2,
              color:
                "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
            },
            {
              label: "Cancelled",
              value: cancelled,
              icon: XCircle,
              color:
                "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">
                      {item.label}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
                      {loading ? "—" : item.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-3 ${item.color}`}>
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors sm:p-7 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your Reservations
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                View and manage all your studio bookings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "pending", "confirmed", "cancelled"].map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                    filter === item
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-xl border border-slate-200 p-5 dark:border-gray-800"
                >
                  <div className="mb-4 h-5 w-2/3 rounded bg-slate-200 dark:bg-gray-700" />
                  <div className="mb-3 h-4 w-1/2 rounded bg-slate-100 dark:bg-gray-800" />
                  <div className="h-20 rounded bg-slate-100 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-8 text-center dark:bg-red-950/30">
              <AlertCircle
                className="mx-auto mb-3 text-red-500"
                size={32}
              />

              <p className="font-semibold text-red-700 dark:text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadBookings()}
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-gray-700">
              <CalendarCheck
                size={45}
                className="mx-auto mb-4 text-slate-300 dark:text-gray-600"
              />

              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {bookings.length === 0
                  ? "No bookings yet"
                  : "No bookings in this category"}
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-gray-400">
                {bookings.length === 0
                  ? "You haven't booked any studio yet. Explore our available studios and make your first reservation."
                  : "There are no bookings available in this category."}
              </p>

              {/* Empty State CTA */}
              {bookings.length === 0 && (
                <Link
                  href="/studios"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  <Search size={18} />
                  Explore Studios
                </Link>
              )}

              {bookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  View All Bookings
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredBookings.map((booking) => {
                const status = getStatus(booking.status);
                const price = getPrice(booking);
                const image = booking.studioImage || booking.image;

                return (
                  <article
                    key={booking._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-indigo-800"
                  >
                    {image && (
                      <div className="h-44 overflow-hidden bg-slate-100 dark:bg-gray-800">
                        <Image
                          width={500}
                          height={300}
                          src={String(image)}
                          alt={getStudioName(booking)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {getStudioName(booking)}
                          </h3>

                          <p className="mt-1 break-all text-xs text-slate-400 dark:text-gray-500">
                            ID: {booking._id}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[status] ||
                            "bg-slate-100 text-slate-600 border-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          }`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>

                      <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-gray-800/70">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                          <CalendarDays
                            size={17}
                            className="shrink-0 text-indigo-500"
                          />
                          <span>
                            {formatDate(
                              booking.date || booking.bookingDate
                            )}
                          </span>
                        </div>

                        {(booking.startTime || booking.endTime) && (
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                            <Clock
                              size={17}
                              className="shrink-0 text-indigo-500"
                            />
                            <span>
                              {booking.startTime || ""}
                              {booking.endTime
                                ? ` - ${booking.endTime}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {booking.location && (
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-gray-300">
                            <MapPin
                              size={17}
                              className="shrink-0 text-indigo-500"
                            />
                            <span>{booking.location}</span>
                          </div>
                        )}

                        {price !== undefined && (
                          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-gray-200">
                            <CreditCard
                              size={17}
                              className="shrink-0 text-indigo-500"
                            />
                            <span>AED {String(price)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-gray-500">
                            Payment status
                          </p>

                          <p className="mt-1 text-sm font-semibold capitalize text-slate-700 dark:text-gray-200">
                            {booking.paymentStatus
                              ? String(booking.paymentStatus)
                              : "Not specified"}
                          </p>
                        </div>

                        {status === "pending" && (
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Cancel Confirmation Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertCircle size={30} />
            </div>

            <h2
              id="cancel-booking-title"
              className="text-center text-xl font-bold text-slate-900 dark:text-white"
            >
              Cancel this booking?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-gray-400">
              Are you sure you want to cancel your booking for{" "}
              <strong className="text-slate-800 dark:text-gray-200">
                {getStudioName(selectedBooking)}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={cancelBooking}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
