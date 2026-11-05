
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

async function DashboardContent() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const stats = [
    { title: "My Listings", value: "0" },
    { title: "Total Bookings", value: "0" },
    { title: "Pending Bookings", value: "0" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {session.user.name}!
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your creative workspace activities.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {item.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h2>

        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
  You don&apos;t have any recent activity yet.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-gray-500 dark:text-gray-400">
          Loading dashboard...
        </p>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
