"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pillars, type Article } from "@/lib/learn";
import { renderMarkdown } from "@/lib/markdown";
import { adminRequest } from "@/components/admin/use-admin";
import { Field, Notice, Section, Select, TextArea, TextInput } from "@/components/admin/admin-ui";
import { Count, SnippetPreview } from "@/components/admin/product-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Form = {
  slug: string;
  pillar: string;
  title: string;
  metaTitle: string;
  description: string;
  body: string;
  cover: string;
  coverAlt: string;
  author: string;
  reviewer: string;
  reviewedAt: string;
  sources: { label: string; url: string }[];
  changelog: { date: string; note: string }[];
  relatedProducts: string;
  status: "draft" | "published";
};

const today = () => new Date().toISOString().slice(0, 10);
const slugify = (s: string) => s.toLowerCase().replace(/[″"']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

function fromArticle(a?: Article): Form {
  return {
    slug: a?.slug ?? "",
    pillar: a?.pillar ?? "handguns",
    title: a?.title ?? "",
    metaTitle: a?.metaTitle ?? "",
    description: a?.description ?? "",
    body: a?.body ?? "## The short answer\n\n",
    cover: a?.cover ?? "",
    coverAlt: a?.coverAlt ?? "",
    author: a?.author ?? "editorial-team",
    reviewer: a?.reviewer ?? "",
    reviewedAt: a?.reviewedAt?.slice(0, 10) ?? "",
    sources: a?.sources ?? [],
    changelog: a?.changelog ?? [{ date: today(), note: "First published." }],
    relatedProducts: a?.relatedProducts.join(", ") ?? "",
    status: a?.status ?? "draft",
  };
}

/** Create/edit a /learn guide → POST /api/admin/articles or PATCH/DELETE /api/admin/articles/:id */
export function ArticleForm({ article, authors, demo }: { article?: Article; authors: { slug: string; name: string }[]; demo?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => fromArticle(article));
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editing = !!article?.id && !demo;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const rendered = useMemo(() => (preview ? renderMarkdown(f.body).html : ""), [preview, f.body]);
  const words = f.body.split(/\s+/).filter(Boolean).length;
  const livePath = `/learn/${f.pillar}/${f.slug}`;

  const submit = async (status: Form["status"]) => {
    setBusy(true);
    setError(null);
    const payload = {
      slug: f.slug,
      pillar: f.pillar,
      title: f.title,
      metaTitle: f.metaTitle || null,
      description: f.description,
      body: f.body,
      cover: f.cover || null,
      coverAlt: f.coverAlt || null,
      author: f.author,
      reviewer: f.reviewer || null,
      reviewedAt: f.reviewedAt || null,
      sources: f.sources.filter((s) => s.label.trim() && s.url.trim()),
      changelog: f.changelog.filter((c) => c.date && c.note.trim()),
      relatedProducts: f.relatedProducts.split(",").map((s) => s.trim()).filter(Boolean),
      status,
    };
    try {
      if (editing) {
        await adminRequest(`/api/admin/articles/${article!.id}`, "PATCH", payload);
        set("status", status);
        toast.success(status === "published" ? "Guide published" : "Draft saved");
        router.refresh();
      } else {
        const res = await adminRequest<{ article: Article }>("/api/admin/articles", "POST", payload);
        toast.success(status === "published" ? "Guide published" : "Draft saved");
        router.push(`/admin/learn/${res.article.id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminRequest(`/api/admin/articles/${article!.id}`, "DELETE");
      toast.success("Guide deleted");
      router.push("/admin/learn");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(f.status);
      }}
      className="grid gap-10 lg:grid-cols-12"
    >
      <div className="space-y-10 lg:col-span-8">
        {demo && <Notice>Built-in guides are read-only. Connect Supabase to write and publish guides.</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        <Section title="Guide">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="a-title" className="sm:col-span-2" hint="Sentence case. Answer the question people search for.">
              <TextInput
                id="a-title"
                required
                value={f.title}
                onChange={(e) => setF((s) => ({ ...s, title: e.target.value, slug: editing || s.slug !== slugify(s.title) ? s.slug : slugify(e.target.value) }))}
              />
            </Field>
            <Field label="Topic" htmlFor="a-pillar">
              <Select id="a-pillar" value={f.pillar} onChange={(e) => set("pillar", e.target.value)} options={pillars.map((p) => ({ value: p.id, label: p.name }))} />
            </Field>
            <Field label="URL slug" htmlFor="a-slug" hint={livePath}>
              <TextInput id="a-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={f.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
            </Field>
          </div>
        </Section>

        <Section title="Body">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-2">
              Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>[link](/product/slug)</code>, <code>- list</code>, <code>| table |</code>, <code>&gt; note</code> · {words} words
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
              {preview ? "Edit" : "Preview"}
            </Button>
          </div>
          {preview ? (
            <div className="guide-prose rounded-lg bg-surface p-5" dangerouslySetInnerHTML={{ __html: rendered }} />
          ) : (
            <TextArea aria-label="Guide body (Markdown)" value={f.body} onChange={(e) => set("body", e.target.value)} className="min-h-[28rem] font-mono text-[0.8125rem]" />
          )}
        </Section>

        <Section title="Sources">
          <p className="mb-3 text-xs text-ink-2">Cite the maker&apos;s page, the statute or the agency for every fact. Shown under the guide.</p>
          <ul className="space-y-2">
            {f.sources.map((s, i) => (
              <li key={i} className="grid grid-cols-[1fr_1.3fr_auto] gap-2">
                <TextInput aria-label="Source name" placeholder="GLOCK — G19 Gen6 technical data" value={s.label} onChange={(e) => set("sources", f.sources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <TextInput aria-label="Source URL" type="url" placeholder="https://…" value={s.url} onChange={(e) => set("sources", f.sources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove source" onClick={() => set("sources", f.sources.filter((_, j) => j !== i))}><Minus /></Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => set("sources", [...f.sources, { label: "", url: "" }])}>
            <Plus /> Add source
          </Button>
        </Section>

        <Section title="What changed">
          <p className="mb-3 text-xs text-ink-2">Add a line whenever you change facts. The guide&apos;s &ldquo;Updated&rdquo; date only moves when the title, summary, body, sources or products change.</p>
          <ul className="space-y-2">
            {f.changelog.map((c, i) => (
              <li key={i} className="grid grid-cols-[9rem_1fr_auto] gap-2">
                <TextInput aria-label="Date" type="date" value={c.date} onChange={(e) => set("changelog", f.changelog.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} />
                <TextInput aria-label="What changed" value={c.note} onChange={(e) => set("changelog", f.changelog.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove entry" onClick={() => set("changelog", f.changelog.filter((_, j) => j !== i))}><Minus /></Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => set("changelog", [{ date: today(), note: "" }, ...f.changelog])}>
            <Plus /> Add entry
          </Button>
        </Section>
      </div>

      <aside className="lg:col-span-4">
        <div className="space-y-8 lg:sticky lg:top-8">
          <Section title="Search & sharing">
            <div className="grid gap-4">
              <Field label="Short description" htmlFor="a-desc" hint={<Count n={f.description.length} max={155} text="The Google snippet and card text." />}>
                <TextArea id="a-desc" required value={f.description} maxLength={220} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label="Search title" htmlFor="a-mt" hint={<Count n={f.metaTitle.length} max={50} text="Optional; the store name is added." />}>
                <TextInput id="a-mt" value={f.metaTitle} maxLength={80} placeholder={f.title} onChange={(e) => set("metaTitle", e.target.value)} />
              </Field>
              <SnippetPreview title={f.metaTitle || f.title} slug={f.slug} text={f.description} path={`learn › ${f.pillar}`} />
            </div>
          </Section>

          <Section title="Products & cover">
            <div className="grid gap-4">
              <Field label="Products in this guide" htmlFor="a-prod" hint="Comma-separated product slugs. Shown as “Shop this guide”, and the guide appears on those product pages.">
                <TextInput id="a-prod" value={f.relatedProducts} onChange={(e) => set("relatedProducts", e.target.value)} placeholder="glock-19-gen6, glock-19-v" />
              </Field>
              <Field label="Cover image (optional)" htmlFor="a-cover" hint="Catalog path or Cloudinary id. Defaults to the first product's photo.">
                <TextInput id="a-cover" value={f.cover} onChange={(e) => set("cover", e.target.value)} />
              </Field>
              <Field label="Cover alt text" htmlFor="a-calt">
                <TextInput id="a-calt" value={f.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="Author & review">
            <div className="grid gap-4">
              <Field label="Author" htmlFor="a-author">
                <Select id="a-author" value={f.author} onChange={(e) => set("author", e.target.value)} options={authors.map((a) => ({ value: a.slug, label: a.name }))} />
              </Field>
              <Field label="Reviewed by" htmlFor="a-rev" hint="Only a real person who checked it, e.g. an attorney for legal guides.">
                <TextInput id="a-rev" value={f.reviewer} onChange={(e) => set("reviewer", e.target.value)} />
              </Field>
              <Field label="Review date" htmlFor="a-revd">
                <TextInput id="a-revd" type="date" value={f.reviewedAt} onChange={(e) => set("reviewedAt", e.target.value)} />
              </Field>
            </div>
          </Section>

          <div className="space-y-2">
            <p className="text-xs font-bold text-ink-2">Status: {f.status === "published" ? "Published" : "Draft (not on the site)"}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="lg" disabled={busy || demo} className="flex-1" onClick={() => submit("published")}>
                {busy ? "Saving…" : f.status === "published" ? "Update guide" : "Publish"}
              </Button>
              <Button type="button" size="lg" variant="outline" disabled={busy || demo} onClick={() => submit("draft")}>
                {f.status === "published" ? "Unpublish" : "Save draft"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {editing && f.status === "published" && (
                <a href={livePath} target="_blank" rel="noopener" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                  View on site <ArrowUpRight />
                </a>
              )}
              {editing &&
                (confirmDelete ? (
                  <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={remove}>
                    Confirm delete
                  </Button>
                ) : (
                  <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setConfirmDelete(true)}>
                    <Trash2 /> Delete
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
