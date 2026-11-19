import { Suspense } from "react";
import { AgeGate, Splash } from "@/components/boot";
import { DesktopNav, NavLinks, NavLinksFallback } from "@/components/desktop-nav";
import { TabBar, TabBarFallback } from "@/components/tab-bar";
import { SiteFooter } from "@/components/site-footer";

/** Storefront chrome: splash, age gate, nav, footer and the phone tab bar. */
export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="pb-tabbar">
      <Splash />
      <AgeGate />
      <DesktopNav
        links={
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        }
      />
      <main id="main">{children}</main>
      <SiteFooter />
      <Suspense fallback={<TabBarFallback />}>
        <TabBar />
      </Suspense>
    </div>
  );
}
