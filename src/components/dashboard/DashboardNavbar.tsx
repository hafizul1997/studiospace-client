
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";

type DashboardNavbarProps = {
  onMenuClick: () => void;
};

export default function DashboardNavbar({
  onMenuClick,
}: DashboardNavbarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 sm:px-6">
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

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-gray-600 sm:block">
          {session?.user?.name || "User"}
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </header>
  );
}
