
import { Suspense } from "react";
import StudioDetailsClient from "./StudioDetailsClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function StudioDetailsPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-background text-gray-600 dark:text-gray-300">
          Loading studio details...
        </div>
      }
    >
      <StudioContent params={params} />
    </Suspense>
  );
}

async function StudioContent({ params }: PageProps) {
  const { id } = await params;

  return <StudioDetailsClient id={id} />;
}
