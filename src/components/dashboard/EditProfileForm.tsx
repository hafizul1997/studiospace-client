
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { LoaderCircle, Save } from "lucide-react";

type Profile = {
  name: string;
  phone: string;
  bio: string;
};

const initialProfile: Profile = {
  name: "",
  phone: "",
  bio: "",
};

const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-green-500 dark:focus:ring-green-900/40";

const labelClasses =
  "text-sm font-medium text-gray-700 dark:text-gray-300";

export default function EditProfileForm() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load profile.");
        }

        const data = await response.json();

        if (active) {
          setProfile({
            name: data.profile?.name ?? "",
            phone: data.profile?.phone ?? "",
            bio: data.profile?.bio ?? "",
          });
        }
      } catch {
        if (active) {
          toast.error("Failed to load profile.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setProfile({
        name: data.profile?.name ?? "",
        phone: data.profile?.phone ?? "",
        bio: data.profile?.bio ?? "",
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        <LoaderCircle className="animate-spin" size={20} />
        Loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      {/* Heading */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Edit Profile
        </h2>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Update your personal information.
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="name" className={labelClasses}>
          Full Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          value={profile.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          maxLength={100}
          required
          className={inputClasses}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className={labelClasses}>
          Email Address
        </label>

        <input
          id="email"
          type="text"
          value="Your registered email is available on the Profile page"
          readOnly
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Email is managed by your authentication account.
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className={labelClasses}>
          Phone Number
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          value={profile.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          maxLength={30}
          className={inputClasses}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label htmlFor="bio" className={labelClasses}>
          About Me
        </label>

        <textarea
          id="bio"
          name="bio"
          value={profile.bio}
          onChange={handleChange}
          placeholder="Tell us a little about yourself..."
          maxLength={500}
          rows={4}
          className={`${inputClasses} resize-y`}
        />

        <p className="text-right text-xs text-gray-500 dark:text-gray-400">
          {profile.bio.length}/500 characters
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-gray-200 pt-5 dark:border-gray-800">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-900"
        >
          {saving ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
