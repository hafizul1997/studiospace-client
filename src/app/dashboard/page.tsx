
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

async function DashboardContent() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {session.user.name}!
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your creative workspace activities.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "My Listings", value: "0" },
          { title: "Total Bookings", value: "0" },
          { title: "Pending Bookings", value: "0" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-gray-500">
              {item.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">
          Recent Activity
        </h2>

        <p className="mt-3 text-sm text-gray-500">
          You don $apos;t have any recent activity yet.
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-gray-500">
          Loading dashboard...
        </p>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
