import { Hero } from "@/components/home/Hero";
import { BrandStory } from "@/components/home/BrandStory";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { CategorySection } from "@/components/home/CategorySection";
import { InteractiveShowcase } from "@/components/home/InteractiveShowcase";
import { LookbookSection } from "@/components/home/LookbookSection";
import { BestSellers } from "@/components/home/BestSellers";
import { NewArrivals } from "@/components/home/NewArrivals";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Cinematic Hero */}
      <Hero />

      {/* 2. Editorial Magazine Brand Story */}
      <BrandStory />

      {/* 3. Horizontal Scroll Featured Showcase */}
      <FeaturedCollection />

      {/* 4. Product Grid */}
      <ProductGridSection />

      {/* 5. Editorial Category Blocks */}
      <CategorySection />

      {/* 6. Sticky Interactive Product Showcase */}
      <InteractiveShowcase />

      {/* 7. Asymmetric Lookbook Campaign */}
      <LookbookSection />

      {/* 8. Best Sellers Carousel */}
      <BestSellers />

      {/* 9. The New Standard / New Arrivals */}
      <NewArrivals />

      {/* 10. Minimalist Newsletter */}
      <NewsletterSection />
    </div>
  );
}
