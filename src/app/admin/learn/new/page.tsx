"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice } from "@/components/admin/admin-ui";
import { ArticleForm } from "@/components/admin/article-form";

/** /admin/learn/new — POST /api/admin/articles (the author list comes from GET /api/admin/articles). */
export default function NewGuide() {
  const { data, error, loading } = useAdmin<{ demo: boolean; authors: { slug: string; name: string }[] }>("/api/admin/articles");
  return (
    <>
      <Link href="/admin/learn" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> Learn
      </Link>
      <AdminTitle title="New guide" meta="Saved as a draft until you publish it." />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data ? <Loading rows={4} /> : <ArticleForm authors={data?.authors ?? []} demo={data?.demo} />}
    </>
  );
}
