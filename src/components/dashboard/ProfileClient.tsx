
"use client";

import { useState } from "react";
import Image from "next/image";
import EditProfileForm from "@/components/dashboard/EditProfileForm";

import {
  UserRound,
  Mail,
  CalendarDays,
  ShieldCheck,
  Camera,
  ChevronUp,
} from "lucide-react";

type ProfileClientProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
    emailVerified: boolean;
    createdAt: Date | string;
  };
};

export default function ProfileClient({ user }: ProfileClientProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal information and account details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="h-36 bg-linear-to-r from-green-600 to-emerald-400" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Profile"}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full border-4 border-white bg-white object-cover dark:border-gray-900 dark:bg-gray-800"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-green-100 text-3xl font-bold text-green-700 dark:border-gray-900 dark:bg-green-950 dark:text-green-400">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="pb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  StudioSpace Member
                </p>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              type="button"
              onClick={() => setShowEditForm((previous) => !previous)}
              aria-expanded={showEditForm}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <Camera size={17} />
              {showEditForm ? "Close Editor" : "Edit Profile"}

              <ChevronUp
                size={17}
                className={`transition-transform ${
                  showEditForm ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Personal Information
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <UserRound
              className="mt-1 shrink-0 text-green-600 dark:text-green-400"
              size={20}
            />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Full Name
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail
              className="mt-1 shrink-0 text-green-600 dark:text-green-400"
              size={20}
            />
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email Address
              </p>
              <p className="mt-1 break-all font-medium text-gray-900 dark:text-gray-100">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-1 shrink-0 text-green-600 dark:text-green-400"
              size={20}
            />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email Verification
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {user.emailVerified ? "Verified" : "Not Verified"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays
              className="mt-1 shrink-0 text-green-600 dark:text-green-400"
              size={20}
            />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Account Created
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {showEditForm && <EditProfileForm />}

      {/* Account Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Account Information
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Your account is connected to StudioSpace authentication.
        </p>

        <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-950/40">
          <p className="text-sm font-medium text-green-800 dark:text-green-400">
            Your account is active.
          </p>
        </div>
      </div>
    </div>
  );
}
