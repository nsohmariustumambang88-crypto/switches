import { HomeBar } from "@/components/page-bar";
import { SearchField } from "@/components/search-field";
import { AmmoBanner, CategoryRow, FflSteps, PosterHero } from "@/components/home-sections";
import { ProductRail, SectionHead } from "@/components/product-lists";
import { getProducts, getTrending } from "@/lib/data/catalog";
import { RecentlyViewed } from "@/components/recently-viewed";

export default async function Home() {
  const [trending, triggers] = await Promise.all([getTrending(8), getProducts("triggers")]);
  return (
    <>
      <HomeBar />
      <div className="px-4 pt-1 pb-2 md:hidden">
        <SearchField />
      </div>

      <PosterHero />

      <div className="mt-10 md:mt-20">
        <CategoryRow />
      </div>

      <RecentlyViewed />

      <section aria-label="Trending" className="mx-auto mt-12 max-w-[90rem] px-4 md:mt-24 md:px-6 lg:px-10">
        <SectionHead title="Trending" href="/shop/all" className="mb-4 md:mb-8" />
        <ProductRail products={trending} />
      </section>

      <div className="mt-14 md:mt-28">
        <AmmoBanner />
      </div>

      <section aria-label="FRT triggers" className="mx-auto mt-14 max-w-[90rem] px-4 md:mt-24 md:px-6 lg:px-10">
        <SectionHead title="FRT triggers" href="/shop/triggers" className="mb-4 md:mb-8" />
        <ProductRail products={triggers.slice(0, 4)} />
      </section>

      <div className="mt-16 md:mt-28">
        <FflSteps />
      </div>
    </>
  );
}
