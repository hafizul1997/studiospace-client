
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import ProfileClient from "@/components/dashboard/ProfileClient";

async function ProfileContent() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <ProfileClient user={session.user} />;
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-gray-500">
          Loading profile...
        </p>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
