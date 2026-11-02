
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LogOut,
  Menu,
  Bell,
  CheckCheck,
  Loader2,
  BellRing,
} from "lucide-react";
import { toast } from "sonner";

type DashboardNavbarProps = {
  onMenuClick: () => void;
};

type Notification = {
  _id: string;
  recipientEmail: string;
  title: string;
  message: string;
  type: string;
  bookingId?: string;
  studioId?: string;
  isRead: boolean;
  createdAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DashboardNavbar({
  onMenuClick,
}: DashboardNavbarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const email = session?.user?.email?.toLowerCase() || "";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Fetch notifications using authenticated session
  const fetchNotifications = useCallback(async () => {
    if (!email) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);

      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || `HTTP Error: ${response.status}`
        );
      }

      const data = await response.json();

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification fetch error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [email]);

  // Load notifications and refresh every 30 seconds
 useEffect(() => {
  if (!email) return;

  let interval: ReturnType<typeof setInterval>;

  const initialTimer = setTimeout(() => {
    fetchNotifications();

    interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
  }, 0);

  return () => {
    clearTimeout(initialTimer);
    clearInterval(interval);
  };
}, [email, fetchNotifications]);

  // Mark one notification as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notification._id}/read`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || "Could not mark notification as read"
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
      toast.error("Could not update notification.");
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!email || unreadCount === 0) return;

    try {
      setMarkingAll(true);

      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.message || "Could not mark all notifications as read"
        );
      }

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, isRead: true }))
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Mark all notifications error:", error);
      toast.error("Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  // Open relevant dashboard page
  const handleNotificationClick = async (
    notification: Notification
  ) => {
    await handleMarkAsRead(notification);

    setNotificationOpen(false);

    if (notification.type === "booking_request") {
      router.push("/dashboard/owner-bookings");
    } else if (
      notification.type === "booking_confirmed" ||
      notification.type === "booking_rejected"
    ) {
      router.push("/dashboard/bookings");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await authClient.signOut();

      toast.success("Logged out successfully");

      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  // Format notification date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Open dashboard menu"
        >
          <Menu size={22} />
        </button>

        <h2 className="font-semibold text-gray-800">
          Dashboard
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-600 sm:block">
          {session?.user?.name || "User"}
        </span>

        {/* Notification button */}
        <div className="relative">
          <button
            onClick={() =>
              setNotificationOpen((previous) => !previous)
            }
            className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notificationOpen && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setNotificationOpen(false)}
                aria-label="Close notifications"
              />

              <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {/* Dropdown header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BellRing
                      size={18}
                      className="text-gray-700"
                    />

                    <h3 className="font-semibold text-gray-800">
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0 || markingAll}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {markingAll ? (
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCheck size={14} />
                    )}

                    Read all
                  </button>
                </div>

                {/* Notification list */}
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications &&
                  notifications.length === 0 ? (
                    <div className="flex justify-center py-10">
                      <Loader2
                        size={24}
                        className="animate-spin text-gray-400"
                      />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell
                        size={30}
                        className="mx-auto mb-2 text-gray-300"
                      />

                      <p className="text-sm font-medium text-gray-600">
                        No notifications yet
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        New booking updates will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        className={`w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
                          !notification.isRead
                            ? "bg-blue-50/60"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.isRead
                                ? "bg-gray-300"
                                : "bg-blue-500"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              {notification.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-600">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[11px] text-gray-400">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t px-4 py-2 text-center">
                  <button
                    onClick={() => {
                      setNotificationOpen(false);
                      router.push("/dashboard/owner-bookings");
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    View booking requests
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
