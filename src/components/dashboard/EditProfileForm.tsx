
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

export default function EditProfileForm() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");

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

      setProfile(data.profile);
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
      <div className="flex items-center gap-2 rounded-xl border bg-white p-6 text-gray-500">
        <LoaderCircle className="animate-spin" size={20} />
        Loading profile...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Edit Profile
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update your personal information.
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-gray-700"
        >
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
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-gray-700"
        >
          Email Address
        </label>

        <input
          id="email"
          type="email"
          value="Your registered email is available on the Profile page"
          readOnly
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
        />

        <p className="text-xs text-gray-500">
          Email is managed by your authentication account.
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="text-sm font-medium text-gray-700"
        >
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
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-sm font-medium text-gray-700"
        >
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
          className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />

        <p className="text-right text-xs text-gray-500">
          {profile.bio.length}/500 characters
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t pt-5">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
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
