"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { MediaAsset } from "@/lib/cloudinary";
import { useStore } from "@/lib/store";
import { adminRequest, uploadImage, useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const PREFIXES = [
  { id: "", label: "All" },
  { id: "catalog/", label: "Catalog" },
  { id: "uploads/", label: "Uploads" },
];

/** /admin/media — GET/DELETE /api/admin/media, POST /api/admin/media/sign (upload) */
export default function MediaAdmin() {
  const [prefix, setPrefix] = useState("");
  const { data, error, loading, reload } = useAdmin<{ demo: boolean; assets: MediaAsset[] }>(
    `/api/admin/media${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ""}`
  );
  const backend = useStore((s) => s.backend);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const f of Array.from(files)) await uploadImage(f);
      toast.success(`${files.length} image${files.length === 1 ? "" : "s"} uploaded`);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id: string) => {
    try {
      await adminRequest(`/api/admin/media?publicId=${encodeURIComponent(id)}`, "DELETE");
      toast.success("Image deleted");
      setConfirm(null);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <AdminTitle
        title="Media"
        meta={data ? `${data.assets.length} images in Cloudinary` : "Cloudinary library for the store folder."}
        actions={
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            <Button size="lg" disabled={!backend || uploading} onClick={() => fileRef.current?.click()}>
              <Upload /> {uploading ? "Uploading…" : "Upload images"}
            </Button>
          </>
        }
      />
      <ToggleGroup
        aria-label="Folder"
        value={[prefix]}
        onValueChange={(v) => setPrefix((v as string[])[0] ?? "")}
        className="mb-6 gap-2"
      >
        {PREFIXES.map((p) => (
          <ToggleGroupItem key={p.id || "all"} value={p.id}>
            {p.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {!backend && <div className="mb-6"><Notice>Browsing works now. Uploads and deletes unlock once Supabase (admin sign-in) is connected.</Notice></div>}
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading rows={3} />}
      {data && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {data.assets.map((a) => (
            <li key={a.publicId} className="group">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-panel">
                <Image src={a.publicId} alt="" fill sizes="(min-width: 1024px) 18vw, 45vw" className="multiply object-contain p-[8%]" />
              </div>
              <p className="mt-1.5 truncate text-xs font-semibold" title={a.publicId}>{a.publicId.split("/").slice(1).join("/")}</p>
              <p className="text-xs text-ink-2 tabular-nums">{a.width}×{a.height} · {Math.round(a.bytes / 1024)} KB</p>
              <div className="mt-1.5 flex gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(a.publicId).then(() => toast("Image id copied — paste it into a product"))}
                >
                  <Copy /> Copy id
                </Button>
                {backend &&
                  (confirm === a.publicId ? (
                    <Button variant="destructive" size="sm" onClick={() => remove(a.publicId)}>Delete</Button>
                  ) : (
                    <Button variant="ghost" size="icon-sm" aria-label="Delete image" onClick={() => setConfirm(a.publicId)}>
                      <Trash2 />
                    </Button>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
