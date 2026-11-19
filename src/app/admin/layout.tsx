import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/config/site";
import {
  AdminAccount,
  AdminGateView,
  AdminNav,
  AdminNavCompact,
  AdminNavFallback,
  DemoStrip,
  StoreLink,
} from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s — Admin — ${site.name}` },
  robots: { index: false, follow: false },
};

/** Back office shell: the storefront's black tab bar becomes the sidebar. */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15.5rem_1fr]">
      <aside className="sticky top-0 z-30 bg-ink text-primary-foreground md:h-dvh">
        <div className="flex h-14 items-center justify-between px-4 md:h-auto md:flex-col md:items-start md:gap-1 md:px-5 md:pt-7 md:pb-6">
          <p className="relative isolate font-display text-[1.375rem] leading-none md:text-[1.75rem]">
            <span aria-hidden="true" className="echo-layer absolute inset-0 -z-10 text-ink-2 [--echo-x:-0.07em] [--echo-y:-0.06em]">
              {site.name}
            </span>
            <span className="relative">{site.name}</span>
          </p>
          <p className="label-caps text-echo">Admin</p>
        </div>
        <nav aria-label="Admin" className="md:hidden">
          <Suspense fallback={<AdminNavFallback compact />}>
            <AdminNavCompact />
          </Suspense>
        </nav>
        <div className="hidden h-[calc(100dvh-6.5rem)] flex-col justify-between px-3 pb-5 md:flex">
          <nav aria-label="Admin">
            <Suspense fallback={<AdminNavFallback />}>
              <AdminNav />
            </Suspense>
          </nav>
          <div className="space-y-4 px-2">
            <StoreLink />
            <AdminAccount />
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <DemoStrip />
        <main id="main" className="mx-auto max-w-[84rem] px-4 pt-6 pb-20 md:px-8 md:pt-10 lg:px-12">
          <AdminGateView>{children}</AdminGateView>
        </main>
      </div>
    </div>
  );
}
