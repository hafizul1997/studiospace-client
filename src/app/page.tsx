
import HeroSlider from "@/components/HeroSlider";
import FeaturedStudios from "@/components/FeaturedStudios";
import CategoryCards from "@/components/CategoryCards";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6 lg:p-8">
      <HeroSlider />
      <FeaturedStudios />
      <CategoryCards />
    </main>
  );
}
