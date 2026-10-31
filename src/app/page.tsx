
import HeroSlider from "@/components/HeroSlider";
import FeaturedStudios from "@/components/FeaturedStudios";
import CategoryCards from "@/components/CategoryCards";
export default function Home() {
  return (
    <>    
    <main className="min-h-screen p-8">
     <HeroSlider />
      <FeaturedStudios />
        <CategoryCards />
      
    </main>
    </>
  );
}