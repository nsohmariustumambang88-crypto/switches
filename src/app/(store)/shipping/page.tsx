import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data/settings";
import { money } from "@/lib/format";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { NotifySignup } from "@/components/notify-signup";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shipping & Delivery: Discreet, Fast-Track, US Only",
  description:
    "Every order ships in a plain, unbranded box. Standard delivery within 3 days or Fast-track express. Firearms ship to your FFL; ammo and parts to your door.",
  alternates: { canonical: "/shipping" },
  openGraph: { url: "/shipping" },
};

const rule = "border-t-[3px] border-ink pt-4";
const h2 = "text-[1.5rem] leading-none font-black tracking-[-0.03em] md:text-[2rem]";

/** /shipping — delivery options, what ships where, packaging, and the US-only policy. */
export default async function ShippingPage() {
  const { shipping: s } = await getSettings();
  return (
    <>
      <PageBar title="Shipping" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle
          title="Shipping"
          meta={<span className="block max-w-xl">Plain boxes, two speeds, United States only. Here&apos;s exactly how your order reaches you.</span>}
        />

        <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
          <div className="min-w-0 space-y-14 lg:col-span-8">
            <section aria-labelledby="speeds" className={rule}>
              <h2 id="speeds" className={h2}>Delivery options</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-panel p-5">
                  <p className="label-caps text-ink-2">Standard — discreet</p>
                  <p className="mt-3 font-display text-[3.5rem] leading-[0.8]">{s.standardDays}<span className="ml-1 text-[1.25rem] tracking-normal">days</span></p>
                  <p className="mt-4 text-sm leading-relaxed text-ink-2">
                    Arrives within {s.standardDays} days. Free over {money(s.freeOver)}; {money(s.flat)} below that.
                  </p>
                </div>
                <div className="rounded-lg bg-ink p-5 text-primary-foreground">
                  <p className="label-caps text-echo">Fast-track</p>
                  <p className="mt-3 font-display text-[3.5rem] leading-[0.8]">{s.expressDays}<span className="ml-1 text-[1.25rem] tracking-normal">{s.expressDays === 1 ? "day" : "days"}</span></p>
                  <p className="mt-4 text-sm leading-relaxed text-echo">Express delivery within {s.expressDays} days for {money(s.express)} on any order.</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2">
                Choose your speed at checkout. Delivery times start once the order ships and can run longer during holidays
                or carrier delays.
              </p>
            </section>

            <section aria-labelledby="where" className={rule}>
              <h2 id="where" className={h2}>What ships where</h2>
              <div className="guide-prose mt-6 max-w-none">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Ships to</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><th scope="row">Handguns and other firearms</th><td>The licensed FFL dealer you choose at checkout. Federal law requires it.</td></tr>
                      <tr><th scope="row">Ammunition</th><td>Your address, with an adult signature on delivery</td></tr>
                      <tr><th scope="row">Triggers, parts and accessories</th><td>Your address</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2">
                Some states and cities restrict ammunition, triggers or parts. We cannot ship restricted items to those
                addresses. New to dealer transfers?{" "}
                <Link href="/learn/buying-online/how-buying-a-handgun-online-works" className="font-semibold text-ink underline underline-offset-2">
                  How buying a handgun online works
                </Link>
                .
              </p>
            </section>

            <section aria-labelledby="packaging" className={rule}>
              <h2 id="packaging" className={h2}>Discreet packaging</h2>
              <div className="mt-5 max-w-2xl space-y-3 text-[0.9375rem] leading-relaxed text-ink-2">
                <p>
                  Every order, at either speed, ships in a plain outer box with no store name, logo or product
                  description on it.
                </p>
                <p>
                  Ammunition packages still carry the small hazardous-materials mark that carriers require on the
                  outside. We can&apos;t leave that off.
                </p>
              </div>
            </section>

            <section id="international" aria-labelledby="intl" className={rule}>
              <h2 id="intl" className={h2}>International orders</h2>
              <div className="mt-5 max-w-2xl space-y-3 text-[0.9375rem] leading-relaxed text-ink-2">
                <p>
                  We ship within the United States only. Firearms, ammunition, triggers and most firearm parts are
                  export-controlled. Sending them abroad needs U.S. export licenses and the destination country&apos;s
                  import permits, so we can&apos;t accept orders for delivery outside the U.S.
                </p>
                <p>Our buying guides are free to read from anywhere. Leave your email and we&apos;ll tell you if international options open up.</p>
              </div>
              <div className="mt-6 max-w-2xl">
                <NotifySignup source="international" />
              </div>
            </section>
          </div>

          <aside className="min-w-0 lg:col-span-4">
            <div className="space-y-3 lg:sticky lg:top-24">
              <p className="label-caps text-ink-2">At a glance</p>
              <ul className="space-y-2 text-sm font-semibold">
                <li className="rounded-lg bg-surface p-4">Plain, unbranded box on every order</li>
                <li className="rounded-lg bg-surface p-4">Standard within {s.standardDays} days · Fast-track within {s.expressDays}</li>
                <li className="rounded-lg bg-surface p-4">Firearms → your FFL dealer · everything else → your door</li>
                <li className="rounded-lg bg-surface p-4">United States only</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Shipping & delivery", path: "/shipping" },
          ]),
        ]}
      />
    </>
  );
}
