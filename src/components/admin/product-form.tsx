"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { img } from "@/config/site";
import { Minus, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { categories, type CategoryId, type Product } from "@/lib/catalog";
import { adminRequest, uploadImage } from "@/components/admin/use-admin";
import { Field, Notice, Section, Select, TextArea, TextInput } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Form = {
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  type: string;
  caliber: string;
  price: string;
  compareAt: string;
  stock: string;
  image: string;
  photo: "" | "light" | "scene";
  figureLabel: string;
  figureValue: string;
  strip: string;
  description: string;
  notice: string;
  ffl: boolean;
  trending: boolean;
  active: boolean;
  specs: [string, string][];
  packs: { rounds: string; price: string }[];
  rating: number;
  reviews: number;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[″"']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function fromProduct(p?: Product): Form {
  return {
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    brand: p?.brand ?? "",
    category: p?.category ?? "handguns",
    type: p?.type ?? "full-size",
    caliber: p?.caliber ?? "",
    price: p ? String(p.price) : "",
    compareAt: p?.compareAt ? String(p.compareAt) : "",
    stock: String(p?.stock ?? 0),
    image: p?.image ?? "",
    photo: p?.photo ?? "",
    figureLabel: p?.figure.label ?? "",
    figureValue: p?.figure.value ?? "",
    strip: p?.strip.join(", ") ?? "",
    description: p?.description ?? "",
    notice: p?.notice ?? "",
    ffl: p?.ffl ?? false,
    trending: p?.trending ?? false,
    active: p?.active ?? true,
    specs: p?.specs ?? [],
    packs: p?.packs?.map((k) => ({ rounds: String(k.rounds), price: String(k.price) })) ?? [],
    rating: p?.rating ?? 0,
    reviews: p?.reviews ?? 0,
  };
}

/** Create/edit form → POST /api/admin/products or PATCH/DELETE /api/admin/products/:id */
export function ProductForm({ product, demo }: { product?: Product; demo?: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => fromProduct(product));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editing = !!product?.id && !demo;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));
  const types = categories.find((c) => c.id === f.category)?.types ?? [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      slug: f.slug,
      name: f.name,
      brand: f.brand,
      category: f.category,
      type: f.type,
      caliber: f.caliber || null,
      price: Number(f.price || 0),
      compareAt: f.compareAt ? Number(f.compareAt) : null,
      rating: f.rating,
      reviews: f.reviews,
      image: f.image,
      photo: f.photo || null,
      figureLabel: f.figureLabel,
      figureValue: f.figureValue,
      strip: f.strip.split(",").map((s) => s.trim()).filter(Boolean),
      description: f.description,
      specs: f.specs.filter(([k, v]) => k.trim() && v.trim()),
      ffl: f.ffl,
      notice: f.notice || null,
      trending: f.trending,
      active: f.active,
      stock: Number(f.stock || 0),
      packs: f.packs.filter((k) => k.rounds && k.price).map((k) => ({ rounds: Number(k.rounds), price: Number(k.price) })),
    };
    try {
      if (editing) {
        await adminRequest(`/api/admin/products/${product!.id}`, "PATCH", payload);
        toast.success("Product saved");
        router.refresh();
      } else {
        const res = await adminRequest<{ product: Product }>("/api/admin/products", "POST", payload);
        toast.success("Product created");
        router.push(`/admin/products/${res.product.id}`);
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
      await adminRequest(`/api/admin/products/${product!.id}`, "DELETE");
      toast.success("Product deleted");
      router.push("/admin/products");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const id = await uploadImage(file);
      set("image", id);
      toast.success("Image uploaded to Cloudinary");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-7">
        {demo && <Notice>Built-in catalog is read-only. Connect Supabase to edit products.</Notice>}
        {error && <Notice tone="error">{error}</Notice>}

        <Section title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="p-name" className="sm:col-span-2">
              <TextInput
                id="p-name"
                required
                value={f.name}
                onChange={(e) => setF((s) => ({ ...s, name: e.target.value, slug: editing || s.slug !== slugify(s.name) ? s.slug : slugify(e.target.value) }))}
              />
            </Field>
            <Field label="URL slug" htmlFor="p-slug" hint={`/product/${f.slug || "…"}`}>
              <TextInput id="p-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={f.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
            </Field>
            <Field label="Brand" htmlFor="p-brand">
              <TextInput id="p-brand" required value={f.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Department" htmlFor="p-cat">
              <Select
                id="p-cat"
                value={f.category}
                onChange={(e) => {
                  const c = e.target.value as CategoryId;
                  setF((s) => ({ ...s, category: c, type: categories.find((x) => x.id === c)?.types[0]?.id ?? "", ffl: c === "handguns" ? true : s.ffl }));
                }}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Field>
            <Field label="Type" htmlFor="p-type">
              <Select id="p-type" value={f.type} onChange={(e) => set("type", e.target.value)} options={types.map((t) => ({ value: t.id, label: t.name }))} />
            </Field>
            <Field label="Caliber" htmlFor="p-cal">
              <TextInput id="p-cal" value={f.caliber} onChange={(e) => set("caliber", e.target.value)} placeholder="9mm, .22 LR, 12 Gauge…" />
            </Field>
          </div>
        </Section>

        <Section title="Price & stock">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (USD)" htmlFor="p-price" hint={f.packs.length ? "Packs below set the price." : undefined}>
              <TextInput id="p-price" inputMode="decimal" required={!f.packs.length} value={f.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label="Compare-at" htmlFor="p-cmp" hint="Shows a strikethrough price.">
              <TextInput id="p-cmp" inputMode="decimal" value={f.compareAt} onChange={(e) => set("compareAt", e.target.value)} />
            </Field>
            <Field label="Stock" htmlFor="p-stock">
              <TextInput id="p-stock" inputMode="numeric" value={f.stock} onChange={(e) => set("stock", e.target.value)} />
            </Field>
          </div>
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold text-ink-2">Round-count packs (ammunition)</p>
            <ul className="space-y-2">
              {f.packs.map((k, i) => (
                <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <TextInput aria-label="Rounds" inputMode="numeric" placeholder="Rounds" value={k.rounds} onChange={(e) => set("packs", f.packs.map((x, j) => (j === i ? { ...x, rounds: e.target.value } : x)))} />
                  <TextInput aria-label="Pack price" inputMode="decimal" placeholder="Price" value={k.price} onChange={(e) => set("packs", f.packs.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove pack" onClick={() => set("packs", f.packs.filter((_, j) => j !== i))}><Minus /></Button>
                </li>
              ))}
            </ul>
            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => set("packs", [...f.packs, { rounds: "", price: "" }])}>
              <Plus /> Add pack
            </Button>
          </div>
        </Section>

        <Section title="Poster">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Figure label" htmlFor="p-fl" hint="Model, Grain, Platform…">
              <TextInput id="p-fl" value={f.figureLabel} onChange={(e) => set("figureLabel", e.target.value)} />
            </Field>
            <Field label="Figure value" htmlFor="p-fv" hint="17, 115, AR-15…">
              <TextInput id="p-fv" value={f.figureValue} onChange={(e) => set("figureValue", e.target.value)} />
            </Field>
            <Field label="Spec strip" htmlFor="p-strip" hint="Comma-separated">
              <TextInput id="p-strip" value={f.strip} onChange={(e) => set("strip", e.target.value)} placeholder="9mm, 17 rd, 4.49″ bbl" />
            </Field>
          </div>
        </Section>

        <Section title="Content">
          <Field label="Description" htmlFor="p-desc">
            <TextArea id="p-desc" value={f.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold text-ink-2">Specifications</p>
            <ul className="space-y-2">
              {f.specs.map(([k, v], i) => (
                <li key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <TextInput aria-label="Spec name" value={k} onChange={(e) => set("specs", f.specs.map((s, j) => (j === i ? [e.target.value, s[1]] : s)))} />
                  <TextInput aria-label="Spec value" value={v} onChange={(e) => set("specs", f.specs.map((s, j) => (j === i ? [s[0], e.target.value] : s)))} />
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove spec" onClick={() => set("specs", f.specs.filter((_, j) => j !== i))}><Minus /></Button>
                </li>
              ))}
            </ul>
            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => set("specs", [...f.specs, ["", ""]])}>
              <Plus /> Add spec
            </Button>
          </div>
          <Field label="Compliance notice" htmlFor="p-notice" className="mt-6" hint="Shown on the product page and in the cart (FFL, state restrictions, NFA…).">
            <TextArea id="p-notice" value={f.notice} onChange={(e) => set("notice", e.target.value)} />
          </Field>
        </Section>
      </div>

      <aside className="space-y-8 lg:col-span-5">
        <div className="lg:sticky lg:top-8 space-y-8">
          <Section title="Image">
            <div className={`relative aspect-[5/4] overflow-hidden rounded-lg ${f.category === "ammunition" ? "bg-panel" : "bg-panel-deep"}`}>
              {f.image ? (
                <Image src={img(f.image)} alt={f.name} fill sizes="(min-width: 1024px) 30vw, 90vw" className="multiply object-contain p-[6%]" />
              ) : (
                <p className="grid h-full place-items-center text-sm text-ink-2">No image yet</p>
              )}
            </div>
            <div className="mt-3 grid gap-3">
              <Field label="Image (catalog path or Cloudinary id)" htmlFor="p-img">
                <TextInput id="p-img" required value={f.image} onChange={(e) => set("image", e.target.value)} />
              </Field>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
              <Button type="button" variant="outline" disabled={demo || uploading} onClick={() => fileRef.current?.click()}>
                <Upload /> {uploading ? "Uploading…" : "Upload to Cloudinary"}
              </Button>
              <Field label="Photo treatment" htmlFor="p-photo" hint="Cut-out shots blend onto the grey panel; lifestyle photos print in grey.">
                <Select id="p-photo" value={f.photo} onChange={(e) => set("photo", e.target.value as Form["photo"])}
                  options={[{ value: "", label: "Cut-out (white background)" }, { value: "light", label: "Studio photo (light ground)" }, { value: "scene", label: "Lifestyle photo (grey print)" }]} />
              </Field>
            </div>
          </Section>

          <Section title="Visibility">
            <div className="space-y-3">
              {(
                [
                  ["active", "Live on the store"],
                  ["trending", "Show in Trending"],
                  ["ffl", "Firearm — ships to an FFL"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center gap-3 text-[0.9375rem] font-medium">
                  <Checkbox checked={f[k]} onCheckedChange={(c) => set(k, !!c)} />
                  {label}
                </label>
              ))}
            </div>
          </Section>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="lg" disabled={busy || demo} className="flex-1">
              {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
            </Button>
            {editing &&
              (confirmDelete ? (
                <Button type="button" size="lg" variant="destructive" disabled={busy} onClick={remove}>
                  Confirm delete
                </Button>
              ) : (
                <Button type="button" size="lg" variant="outline" disabled={busy} onClick={() => setConfirmDelete(true)}>
                  <Trash2 /> Delete
                </Button>
              ))}
          </div>
        </div>
      </aside>
    </form>
  );
}
