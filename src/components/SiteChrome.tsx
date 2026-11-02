
"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function SiteChromeContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboard && <Navbar />}

      <main>{children}</main>

      {!isDashboard && <Footer />}
    </>
  );
}

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<main>{children}</main>}>
      <SiteChromeContent>{children}</SiteChromeContent>
    </Suspense>
  );
}
