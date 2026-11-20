"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Article } from "@/lib/learn";
import { useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice } from "@/components/admin/admin-ui";
import { ArticleForm } from "@/components/admin/article-form";

/** /admin/learn/:id — GET /api/admin/articles/:id */
export function EditGuide({ id }: { id: string }) {
  const { data, error, loading } = useAdmin<{ demo: boolean; article: Article; authors: { slug: string; name: string }[] }>(
    `/api/admin/articles/${encodeURIComponent(id)}`
  );
  return (
    <>
      <Link href="/admin/learn" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        <ArrowLeft className="size-4" /> Learn
      </Link>
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading />}
      {data && (
        <>
          <AdminTitle title={data.article.title.charAt(0).toUpperCase() + data.article.title.slice(1)} />
          <ArticleForm key={data.article.id} article={data.article} authors={data.authors} demo={data.demo} />
        </>
      )}
    </>
  );
}
