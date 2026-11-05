
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
  const [markingId, setMarkingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // ======================================
  // Fetch Notifications
  // ======================================

  const fetchNotifications = useCallback(async () => {
    if (!email) {
      setNotifications([]);
      return;
    }

    try {
      setLoadingNotifications(true);

      const response = await fetch("/api/backend/notifications", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.message || `HTTP Error: ${response.status}`
        );
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification fetch error:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [email]);

  // ======================================
  // Load Notifications Every 30 Seconds
  // ======================================

  useEffect(() => {
    if (!email) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    const initialTimer = setTimeout(() => {
      fetchNotifications();

      interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
    }, 0);

    return () => {
      clearTimeout(initialTimer);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, [email, fetchNotifications]);

  // ======================================
  // Mark Single Notification as Read
  // ======================================

  const handleMarkAsRead = async (
    notification: Notification
  ): Promise<boolean> => {
    if (notification.isRead) return true;

    try {
      setMarkingId(notification._id);

      const response = await fetch(
        `/api/backend/notifications/${encodeURIComponent(
          notification._id
        )}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );

      return true;
    } catch (error) {
      console.error("Mark as Read Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to mark notification as read."
      );

      return false;
    } finally {
      setMarkingId(null);
    }
  };

  // ======================================
  // Mark All Notifications as Read
  // ======================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    try {
      setMarkingAll(true);

      const response = await fetch(
        "/api/backend/notifications/read-all",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to update notifications."
        );
      }

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      toast.success("All notifications marked as read.");
    } catch (error) {
      console.error("Mark All as Read Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ======================================
  // Handle Notification Click
  // ======================================

  const handleNotificationClick = async (
    notification: Notification
  ) => {
    const success = await handleMarkAsRead(notification);

    if (!success) return;

    setNotificationOpen(false);

    if (notification.type === "booking_request") {
      router.push("/dashboard/owner-bookings");
    } else if (
      notification.type === "booking_confirmed" ||
      notification.type === "booking_rejected" ||
      notification.type === "booking"
    ) {
      router.push("/dashboard/bookings");
    }
  };

  // ======================================
  // Logout
  // ======================================

  const handleLogout = async () => {
    try {
      await authClient.signOut();

      toast.success("Logged out successfully");

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // ======================================
  // Format Notification Date
  // ======================================

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently";
    }

    return parsedDate.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ======================================
  // UI
  // ======================================

  return (
    <header className="relative z-30 flex h-16 min-w-0 shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-900 sm:px-6">

      {/* Left side */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
          aria-label="Open dashboard menu"
        >
          <Menu size={22} />
        </button>

        <h2 className="truncate text-sm font-semibold text-gray-800 dark:text-white sm:text-base">
          Dashboard
        </h2>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

        <span className="hidden text-sm text-gray-600 dark:text-gray-300 sm:block">
          {session?.user?.name || "User"}
        </span>

        {/* Notification button */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setNotificationOpen((previous) => !previous)
            }
            className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                type="button"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setNotificationOpen(false)}
                aria-label="Close notifications"
              />

              <div className="fixed right-4 top-20 z-50 w-[calc(100vw-32px)] max-w-90 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 sm:absolute sm:right-0 sm:top-12 sm:w-90">

                {/* Dropdown header */}
                <div className="flex min-w-0 items-center justify-between gap-2 border-b border-gray-200 px-3 py-3 dark:border-gray-700 sm:px-4">

                  <div className="flex min-w-0 items-center gap-2">
                    <BellRing
                      size={18}
                      className="shrink-0 text-gray-700 dark:text-gray-300"
                    />

                    <h3 className="whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-white">
                      Notifications
                    </h3>

                    {unreadCount > 0 && (
                      <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0 || markingAll}
                    className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-600 transition hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40 dark:text-blue-400 dark:hover:text-blue-300"
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
                <div className="max-h-[65vh] overflow-y-auto sm:max-h-96">

                  {loadingNotifications &&
                  notifications.length === 0 ? (
                    <div className="flex justify-center py-10">
                      <Loader2
                        size={24}
                        className="animate-spin text-gray-400 dark:text-gray-500"
                      />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center">
                      <Bell
                        size={30}
                        className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
                      />

                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No notifications yet
                      </p>

                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        New booking updates will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification._id}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                        disabled={markingId === notification._id}
                        className={`w-full border-b border-gray-100 px-3 py-3 text-left transition hover:bg-gray-50 disabled:cursor-wait dark:border-gray-800 dark:hover:bg-gray-800 sm:px-4 ${
                          !notification.isRead
                            ? "bg-blue-50/60 dark:bg-blue-950/30"
                            : "bg-white dark:bg-gray-900"
                        }`}
                      >
                        <div className="flex min-w-0 items-start gap-3">

                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                              notification.isRead
                                ? "bg-gray-300 dark:bg-gray-600"
                                : "bg-blue-500"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="wrap-anywhere text-sm font-semibold text-gray-800 dark:text-gray-100">
                              {notification.title}
                            </p>

                            <p className="mt-1 wrap-anywhere text-xs leading-5 text-gray-600 dark:text-gray-400">
                              {notification.message}
                            </p>

                            <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          {markingId === notification._id && (
                            <Loader2
                              size={16}
                              className="shrink-0 animate-spin text-gray-400 dark:text-gray-500"
                            />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-4 py-2 text-center dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen(false);
                      router.push("/dashboard/owner-bookings");
                    }}
                    className="text-xs font-medium text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
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
          type="button"
          onClick={handleLogout}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70 sm:gap-2 sm:px-3"
        >
          <LogOut size={17} />
          <span className="text-xs sm:text-sm">Logout</span>
        </button>
      </div>
    </header>
  );
}
