
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit?: number;
  maxCapacity: number;
  location: string;
  imageUrl: string;
  amenities?: string[];
  description: string;
  rating?: number;
}

interface StudioDetailsClientProps {
  id: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getLocalToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function StudioDetailsClient({
  id,
}: StudioDetailsClientProps) {
  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guests, setGuests] = useState("1");

  const [localToday] = useState(getLocalToday);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch studio details
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function fetchStudio() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/studios/${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Studio not found."
              : "Failed to load studio details."
          );
        }

        const data: Studio = await response.json();

        setStudio(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchStudio();

    return () => controller.abort();
  }, [id]);

  // Calculate booking duration and price
  const totalHours =
    startTime && endTime && endTime > startTime
      ? (new Date(`2000-01-01T${endTime}:00`).getTime() -
          new Date(`2000-01-01T${startTime}:00`).getTime()) /
        (1000 * 60 * 60)
      : 0;

  const totalPrice =
    studio && totalHours > 0
      ? totalHours * Number(studio.hourlyRate)
      : 0;

  // Submit booking
  async function handleBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!studio) return;

    setBookingMessage("");
    setBookingSuccess(false);

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      setBookingMessage("Please fill in all required fields.");
      return;
    }

    if (bookingDate < localToday) {
      setBookingMessage("Please select today or a future date.");
      return;
    }

    if (startTime >= endTime) {
      setBookingMessage("End time must be later than start time.");
      return;
    }

    const guestNumber = Number(guests);

    if (
      !Number.isInteger(guestNumber) ||
      guestNumber < 1 ||
      guestNumber > Number(studio.maxCapacity)
    ) {
      setBookingMessage(
        `Guest number must be between 1 and ${studio.maxCapacity}.`
      );
      return;
    }

    try {
      setBookingLoading(true);

      // Send booking through the Next.js same-origin proxy
      const response = await fetch("/api/backend/bookings", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioId: studio._id,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          bookingDate,
          startTime,
          endTime,
          guests: guestNumber,
        }),
        cache: "no-store",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Booking request failed (${response.status}).`
        );
      }

      setBookingSuccess(true);
      setBookingMessage(
        data.message || "Your booking request was submitted successfully!"
      );

      setBookingDate("");
      setStartTime("");
      setEndTime("");
      setGuests("1");
    } catch (err) {
      setBookingMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  }

  function closeBookingDialog() {
    setBookingOpen(false);
    setBookingMessage("");
    setBookingSuccess(false);
  }

  // Invalid ID state
  if (!id) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Invalid Studio ID
        </h2>

        <p className="mt-2 text-gray-500">
          The studio ID you provided is invalid.
        </p>

        <Link
          href="/studios"
          className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Back to Studios
        </Link>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">
          Loading studio details...
        </span>
      </div>
    );
  }

  // Error state
  if (error || !studio) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {error || "Studio not found"}
        </h2>

        <p className="mt-2 text-gray-500">
          We could not find the studio you are looking for.
        </p>

        <Link
          href="/studios"
          className="mt-6 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Back to Studios
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/studios"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-primary"
        >
          <ArrowLeft size={18} />
          Back to Studios
        </Link>

        {/* Studio image */}
        <div className="relative h-[/280px] overflow-hidden rounded-2xl bg-gray-200 sm:h-[/400px]">
          {studio.imageUrl ? (
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage: `url("${studio.imageUrl}")`,
              }}
              role="img"
              aria-label={studio.title}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No studio image available
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left side */}
          <section className="space-y-6 lg:col-span-2">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  {studio.category}
                </span>

                {studio.rating !== undefined && (
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    {studio.rating}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {studio.title}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-gray-500">
                <MapPin size={18} />
                {studio.location}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">
                About This Studio
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {studio.description || "No description available."}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Studio Information
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Clock className="text-primary" size={22} />
                  <div>
                    <p className="text-sm text-gray-500">Hourly Rate</p>
                    <p className="font-semibold text-gray-900">
                      AED {studio.hourlyRate} / hour
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="text-primary" size={22} />
                  <div>
                    <p className="text-sm text-gray-500">
                      Maximum Capacity
                    </p>
                    <p className="font-semibold text-gray-900">
                      {studio.maxCapacity} people
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {studio.amenities && studio.amenities.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Amenities
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  {studio.amenities.map((amenity, index) => (
                    <span
                      key={`${amenity}-${index}`}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Right side booking card */}
          <aside className="h-fit rounded-2xl border bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-sm text-gray-500">Starting from</p>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                AED {studio.hourlyRate}
              </span>
              <span className="text-gray-500">/ hour</span>
            </div>

            <div className="my-5 border-t" />

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Category</span>
                <span className="font-medium text-gray-900">
                  {studio.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Maximum guests</span>
                <span className="font-medium text-gray-900">
                  {studio.maxCapacity}
                </span>
              </div>

              {studio.securityDeposit !== undefined && (
                <div className="flex items-center justify-between">
                  <span>Security deposit</span>
                  <span className="font-medium text-gray-900">
                    AED {studio.securityDeposit}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Book Now
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Submit a booking request to reserve this studio.
            </p>
          </aside>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[/520px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Book This Studio
            </DialogTitle>

            <DialogDescription>
              Enter your details and choose your preferred booking date and
              time.
            </DialogDescription>
          </DialogHeader>

          {bookingSuccess ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Booking Request Submitted!
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {bookingMessage}
              </p>

              <button
                type="button"
                onClick={closeBookingDialog}
                className="mt-6 h-11 w-full rounded-xl bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="customerEmail"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="bookingDate"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Booking Date
                </label>

                <input
                  id="bookingDate"
                  type="date"
                  min={localToday}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="startTime"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>

                  <input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    End Time
                  </label>

                  <input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="guests"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Number of Guests
                </label>

                <input
                  id="guests"
                  type="number"
                  min="1"
                  max={studio.maxCapacity}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Maximum capacity: {studio.maxCapacity} guests
                </p>
              </div>

              {totalHours > 0 && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Duration</span>
                    <span>{totalHours} hour(s)</span>
                  </div>

                  <div className="mt-2 flex justify-between text-sm text-gray-600">
                    <span>Hourly rate</span>
                    <span>AED {studio.hourlyRate}</span>
                  </div>

                  <div className="mt-3 flex justify-between border-t pt-3 font-bold text-gray-900">
                    <span>Estimated total</span>
                    <span>AED {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {bookingMessage && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    bookingSuccess
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {bookingMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={bookingLoading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
