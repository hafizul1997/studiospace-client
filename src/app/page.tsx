import { Suspense } from "react";
import StudioList from "../components/StudioList";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import FeaturedStudios from "@/components/FeaturedStudios";
export default function Home() {
  return (
    <>    
    <Navbar />
    <main className="min-h-screen p-8">
      
     <HeroSlider />
      <FeaturedStudios />
      <Suspense fallback={<p>Loading studios...</p>}>
        <StudioList />
      </Suspense>
    </main>
    </>
  );
}