
"use client";

import { useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import {
  Search,
  CalendarDays,
  Clock,
  Users,
  MapPin,
  XCircle,
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
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string;
};

export default function MyBookingsPage() {
  const { data: session, isPending } = authClient.useSession();

  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch current user's bookings
  useEffect(() => {
    if (isPending || !session?.user?.email) return;

    let ignore = false;

    const fetchMyBookings = async () => {
      try {
        const email = encodeURIComponent(session.user.email);

        const response = await fetch(
          `http://localhost:5000/api/my-bookings?email=${email}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data: Booking[] = await response.json();

        if (!ignore) {
          setBookings(data);
        }
      } catch (error) {
        console.error("My bookings error:", error);

        if (!ignore) {
          setBookings([]);
          toast.error("Could not load your bookings");
        }
      }
    };

    fetchMyBookings();

    return () => {
      ignore = true;
    };
  }, [session, isPending]);

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
    if (!session?.user?.email) return;

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
        `http://localhost:5000/api/bookings/${booking._id}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email.toLowerCase(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to cancel booking");
      }

      // Update UI without refreshing
      setBookings((previous) =>
        (previous ?? []).map((item) =>
          item._id === booking._id
            ? { ...item, status: "Cancelled" }
            : item
        )
      );

      toast.success("Booking cancelled successfully!");
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

  // Bookings loading
  if (bookings === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        Loading your bookings...
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Bookings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your studio booking requests.
        </p>
      </div>

      {/* Booking Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <h2 className="mt-2 text-2xl font-bold">
            {bookings.length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="mt-2 text-2xl font-bold text-yellow-600">
            {bookings.filter((b) => b.status === "Pending").length}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Confirmed</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {bookings.filter((b) => b.status === "Confirmed").length}
          </h2>
        </div>
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
            placeholder="Search by studio name or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-black"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
        >
          <option value="All">All Bookings</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredBookings.length} of {bookings.length} bookings
      </p>

      {/* Booking List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <CalendarDays
            size={40}
            className="mx-auto text-gray-400"
          />

          <h2 className="mt-4 text-lg font-semibold text-gray-800">
            {bookings.length === 0
              ? "You haven't made any bookings yet."
              : "No matching bookings found."}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {bookings.length === 0
              ? "Explore studios and make your first booking."
              : "Try another search or status filter."}
          </p>

          {bookings.length === 0 && (
            <Link
              href="/studios"
              className="mt-5 inline-block rounded-lg bg-black px-5 py-2.5 text-white"
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
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              {/* Booking Header */}
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {booking.studioTitle}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Booking ID: {booking._id}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Booking Information */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <CalendarDays size={19} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Booking Date</p>
                    <p className="text-sm font-medium">
                      {booking.bookingDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock size={19} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium">
                      {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users size={19} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="text-sm font-medium">
                      {booking.guests} people
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin size={19} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium">
                      {booking.totalHours} hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="mt-5 flex flex-col justify-between gap-4 border-t pt-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs text-gray-500">
                    Total Booking Price
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    AED {Number(booking.totalPrice).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/studios/${booking.studioId}`}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    View Studio
                  </Link>

                  {booking.status === "Pending" && (
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={cancellingId === booking._id}
                      className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={16} />
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
