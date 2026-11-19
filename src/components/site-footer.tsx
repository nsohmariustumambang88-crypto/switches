import Link from "next/link";
import { categories } from "@/lib/catalog";
import { site } from "@/config/site";
import { Lockup } from "@/components/brand";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/15 md:mt-28">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-12 md:grid-cols-12 md:px-6 lg:px-10">
        <div className="md:col-span-5">
          <p className="max-w-sm text-sm leading-relaxed text-ink-2">{site.description}</p>
          <p className="mt-6 text-sm font-bold">{site.supportEmail}</p>
          <p className="text-sm text-ink-2">{site.supportPhone}</p>
        </div>
        <nav aria-label="Shop" className="md:col-span-2">
          <p className="label-caps text-ink-2">Shop</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop/${c.id}`} className="hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Account" className="md:col-span-2">
          <p className="label-caps text-ink-2">Account</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold">
            <li><Link href="/orders" className="hover:underline">Orders</Link></li>
            <li><Link href="/favorites" className="hover:underline">Favorites</Link></li>
            <li><Link href="/profile" className="hover:underline">Profile</Link></li>
            <li><Link href="/welcome" className="hover:underline">Sign in</Link></li>
          </ul>
        </nav>
        <Lockup lines={site.lockup} className="text-[5.5rem] md:col-span-3 md:text-[6rem]" />
      </div>
      <div className="border-t border-ink/15">
        <p className="mx-auto max-w-[90rem] px-4 py-6 text-xs leading-relaxed text-ink-2 md:px-6 lg:px-10">
          All firearms ship to a federally licensed dealer (FFL) for transfer and background
          check. You must be {site.minimumAge} or older to buy handguns and handgun ammunition.
          Some products cannot ship to certain states. Know your local laws.
          {site.preview && (
            <strong className="mt-2 block font-bold text-ink">
              Preview build: prices, ratings, review counts and shipping terms are placeholder data.
            </strong>
          )}
        </p>
      </div>
    </footer>
  );
}
