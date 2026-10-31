import { Suspense } from "react";
import StudioList from "../components/StudioList";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
export default function Home() {
  return (
    <>    
    <Navbar />
    <HeroSlider />
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">
        StudioSpace
      </h1>

      <h2 className="mt-6 text-xl font-semibold">
        Explore Studios
      </h2>

      <Suspense fallback={<p>Loading studios...</p>}>
        <StudioList />
      </Suspense>
    </main>
    </>
  );
}