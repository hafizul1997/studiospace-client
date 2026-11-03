
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
} from "lucide-react";
import Image from "next/image";
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
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
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
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel booking.");
      }

      setSelectedBooking(null);
      await loadBookings();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Something went wrong."
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Customer Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              My Bookings
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage your studio reservations in one place.
            </p>
          </div>

          <button
            onClick={() => void loadBookings()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
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
              color: "bg-indigo-100 text-indigo-600",
            },
            {
              label: "Pending",
              value: pending,
              icon: Hourglass,
              color: "bg-amber-100 text-amber-600",
            },
            {
              label: "Confirmed",
              value: confirmed,
              icon: CheckCircle2,
              color: "bg-emerald-100 text-emerald-600",
            },
            {
              label: "Cancelled",
              value: cancelled,
              icon: XCircle,
              color: "bg-red-100 text-red-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>
                    <h2 className="mt-3 text-3xl font-bold text-slate-900">
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
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Your Reservations
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                View and manage all your studio bookings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "pending", "confirmed", "cancelled"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                    filter === item
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                  className="animate-pulse rounded-xl border border-slate-200 p-5"
                >
                  <div className="mb-4 h-5 w-2/3 rounded bg-slate-200" />
                  <div className="mb-3 h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-8 text-center">
              <AlertCircle className="mx-auto mb-3 text-red-500" size={32} />
              <p className="font-semibold text-red-700">{error}</p>
              <button
                onClick={() => void loadBookings()}
                className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
              <CalendarCheck
                size={45}
                className="mx-auto mb-4 text-slate-300"
              />
              <h3 className="text-lg font-bold text-slate-800">
                {bookings.length === 0
                  ? "No bookings yet"
                  : "No bookings in this category"}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Your studio reservations will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredBookings.map((booking) => {
                const status = getStatus(booking.status);
                const price = getPrice(booking);

                const image =
                  booking.studioImage || booking.image;

                return (
                  <article
                    key={booking._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-lg"
                  >
                    {image && (
                      <div className="h-44 overflow-hidden bg-slate-100">
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
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {getStudioName(booking)}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            ID: {booking._id}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                            statusStyles[status] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {booking.status || "Pending"}
                        </span>
                      </div>

                      <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <CalendarDays size={17} className="text-indigo-500" />
                          <span>
                            {formatDate(
                              booking.date || booking.bookingDate
                            )}
                          </span>
                        </div>

                        {(booking.startTime || booking.endTime) && (
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <Clock size={17} className="text-indigo-500" />
                            <span>
                              {booking.startTime || ""}
                              {booking.endTime
                                ? ` - ${booking.endTime}`
                                : ""}
                            </span>
                          </div>
                        )}

                        {booking.location && (
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <MapPin size={17} className="text-indigo-500" />
                            <span>{booking.location}</span>
                          </div>
                        )}

                        {price !== undefined && (
                          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                            <CreditCard size={17} className="text-indigo-500" />
                            <span>
                              AED {String(price)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            Payment status
                          </p>
                          <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                            {booking.paymentStatus
                              ? String(booking.paymentStatus)
                              : "Not specified"}
                          </p>
                        </div>

                        {status === "pending" && (
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={30} />
            </div>

            <h2 className="text-center text-xl font-bold text-slate-900">
              Cancel this booking?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to cancel your booking for{" "}
              <strong>{getStudioName(selectedBooking)}</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-7 flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                disabled={cancelling}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                onClick={cancelBooking}
                disabled={cancelling}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
