"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { pillars, type Article } from "@/lib/learn";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice } from "@/components/admin/admin-ui";
import { buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const day = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** /admin/learn — GET /api/admin/articles */
export default function LearnAdmin() {
  const { data, error, loading } = useAdmin<{ demo: boolean; articles: Article[] }>("/api/admin/articles");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return (data?.articles ?? []).filter(
      (a) => (!status || a.status === status) && words.every((w) => `${a.title} ${a.slug} ${a.pillar}`.toLowerCase().includes(w))
    );
  }, [data, status, q]);

  return (
    <>
      <AdminTitle
        title="Learn"
        meta={data ? `${list.length} of ${data.articles.length} guides${data.demo ? " · built-in guides (read-only)" : ""}` : undefined}
        actions={
          <Link href="/admin/learn/new" className={cn(buttonVariants({ size: "lg" }), data?.demo && "pointer-events-none opacity-45")} aria-disabled={data?.demo}>
            <Plus /> New guide
          </Link>
        }
      />
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ToggleGroup aria-label="Filter by status" value={[status]} onValueChange={(v) => setStatus((v as string[])[0] ?? "")} className="gap-2">
          <ToggleGroupItem value="">All</ToggleGroupItem>
          <ToggleGroupItem value="published">Published</ToggleGroupItem>
          <ToggleGroupItem value="draft">Drafts</ToggleGroupItem>
        </ToggleGroup>
        <div className="relative md:w-72">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" />
          <label htmlFor="learn-q" className="sr-only">Search guides</label>
          <input
            id="learn-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search guides"
            className="h-11 w-full rounded-lg border border-ink/20 bg-surface pr-3 pl-9 text-sm outline-none focus-visible:border-ink"
          />
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data ? (
        <Loading />
      ) : (
        <ul className="divide-y divide-ink/10 rounded-lg bg-surface">
          {list.map((a) => (
            <li key={a.id}>
              <Link href={`/admin/learn/${encodeURIComponent(a.id ?? "")}`} className="grid gap-1 px-4 py-4 hover:bg-ink/5 md:grid-cols-[1fr_9rem_8rem_7rem] md:items-center md:gap-4">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{a.title.charAt(0).toUpperCase() + a.title.slice(1)}</span>
                  <span className="block truncate text-xs text-ink-2">/learn/{a.pillar}/{a.slug}</span>
                </span>
                <span className="text-sm text-ink-2">{pillars.find((p) => p.id === a.pillar)?.name}</span>
                <span className="text-sm text-ink-2">Updated {day(a.updatedAt)}</span>
                <span className={cn("label-caps", a.status === "published" ? "text-ink" : "text-ink-2")}>{a.status === "published" ? "Published" : "Draft"}</span>
              </Link>
            </li>
          ))}
          {!list.length && <li className="px-4 py-10 text-center text-sm text-ink-2">No guides match.</li>}
        </ul>
      )}
    </>
  );
}
