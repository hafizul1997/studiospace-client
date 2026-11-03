
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
                        disabled={markingId === notification._id}
                        className={`w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 disabled:cursor-wait ${
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

                          {markingId === notification._id && (
                            <Loader2
                              size={16}
                              className="animate-spin text-gray-400"
                            />
                          )}
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
