"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { money } from "@/lib/format";
import { dealerAddress, type Dealer } from "@/lib/catalog";
import { stateFromZip } from "@/lib/us";
import { adminRequest, useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Field, Loading, Notice, TextInput } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Draft = {
  id?: string;
  name: string;
  licenseNo: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  transferFee: string;
  active: boolean;
};

const blank: Draft = { name: "", licenseNo: "", address: "", city: "", state: "", zip: "", phone: "", email: "", transferFee: "", active: true };

const toDraft = (d: Dealer): Draft => ({
  id: d.id,
  name: d.name,
  licenseNo: d.licenseNo ?? "",
  address: d.address,
  city: d.city,
  state: d.state,
  zip: d.zip,
  phone: d.phone ?? "",
  email: d.email ?? "",
  transferFee: d.transferFee != null ? String(d.transferFee) : "",
  active: d.active ?? true,
});

/** /admin/dealers — GET/POST /api/admin/dealers, PATCH/DELETE /api/admin/dealers/:id */
export default function DealersAdmin() {
  const { data, error, loading, reload } = useAdmin<{ demo: boolean; dealers: Dealer[] }>("/api/admin/dealers");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    const { id, ...rest } = draft;
    const body = { ...rest, transferFee: rest.transferFee ? Number(rest.transferFee) : null };
    try {
      if (id) await adminRequest(`/api/admin/dealers/${id}`, "PATCH", body);
      else await adminRequest("/api/admin/dealers", "POST", body);
      toast.success(id ? "Dealer saved" : "Dealer added");
      setDraft(null);
      reload();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!draft?.id) return;
    setBusy(true);
    try {
      await adminRequest(`/api/admin/dealers/${draft.id}`, "DELETE");
      toast.success("Dealer removed");
      setDraft(null);
      reload();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <>
      <AdminTitle
        title="FFL dealers"
        meta="Dealers shoppers can choose at checkout to receive firearms."
        actions={
          <Button size="lg" disabled={data?.demo} onClick={() => { setConfirm(false); setDraft({ ...blank }); }}>
            <Plus /> Add dealer
          </Button>
        }
      />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading />}
      {data?.demo && <div className="mb-6"><Notice>Sample dealers (read-only). Connect Supabase to manage the real list.</Notice></div>}
      {data && (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.dealers.map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-4 rounded-lg bg-surface p-4">
              <div className="min-w-0 text-sm leading-relaxed">
                <p className="font-extrabold">{d.name}</p>
                <p className="text-ink-2">{dealerAddress(d)}</p>
                <p className="mt-1 text-xs text-ink-2">
                  {d.licenseNo ? `FFL ${d.licenseNo} · ` : ""}
                  {d.transferFee != null ? `Transfer ${money(d.transferFee)}` : "Fee set by dealer"}
                  {d.active === false && " · Hidden"}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label={`Edit ${d.name}`} disabled={data.demo} onClick={() => { setConfirm(false); setDraft(toDraft(d)); }}>
                <Pencil />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <SheetContent side="right" className="w-full gap-0 border-l-0 bg-ground p-0 sm:max-w-md">
          <form onSubmit={save} className="flex h-full flex-col">
            <SheetHeader className="px-5 pt-5 pb-3">
              <SheetTitle className="text-xl font-extrabold">{draft?.id ? "Edit dealer" : "Add dealer"}</SheetTitle>
              <SheetDescription className="text-ink-2">Shown to shoppers at checkout, nearest ZIP first.</SheetDescription>
            </SheetHeader>
            {draft && (
              <div className="grid flex-1 grid-cols-6 content-start gap-3 overflow-y-auto px-5 pb-6">
                <Field label="Dealer name" htmlFor="d-name" className="col-span-6"><TextInput id="d-name" required value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
                <Field label="FFL licence number" htmlFor="d-lic" className="col-span-6"><TextInput id="d-lic" value={draft.licenseNo} onChange={(e) => set("licenseNo", e.target.value)} /></Field>
                <Field label="Street address" htmlFor="d-addr" className="col-span-6"><TextInput id="d-addr" required value={draft.address} onChange={(e) => set("address", e.target.value)} /></Field>
                <Field label="City" htmlFor="d-city" className="col-span-3"><TextInput id="d-city" required value={draft.city} onChange={(e) => set("city", e.target.value)} /></Field>
                <Field label="State" htmlFor="d-state" className="col-span-1"><TextInput id="d-state" required maxLength={2} value={draft.state} onChange={(e) => set("state", e.target.value.toUpperCase())} /></Field>
                <Field label="ZIP" htmlFor="d-zip" className="col-span-2"><TextInput id="d-zip" required inputMode="numeric" autoComplete="postal-code" value={draft.zip} onChange={(e) => { const v = e.target.value; set("zip", v); const s = !draft.state ? stateFromZip(v) : null; if (s) set("state", s); }} /></Field>
                <Field label="Phone" htmlFor="d-phone" className="col-span-3"><TextInput id="d-phone" value={draft.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
                <Field label="Transfer fee" htmlFor="d-fee" className="col-span-3"><TextInput id="d-fee" inputMode="decimal" value={draft.transferFee} onChange={(e) => set("transferFee", e.target.value)} /></Field>
                <Field label="Email" htmlFor="d-email" className="col-span-6"><TextInput id="d-email" type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} /></Field>
                <label className="col-span-6 flex cursor-pointer items-center gap-3 pt-2 text-[0.9375rem] font-medium">
                  <Checkbox checked={draft.active} onCheckedChange={(c) => set("active", !!c)} />
                  Show at checkout
                </label>
              </div>
            )}
            <SheetFooter className="flex-row gap-2 border-t border-ink/15 px-5 py-4">
              <Button type="submit" size="lg" className="flex-1" disabled={busy}>{busy ? "Saving…" : "Save dealer"}</Button>
              {draft?.id &&
                (confirm ? (
                  <Button type="button" size="lg" variant="destructive" disabled={busy} onClick={remove}>Confirm</Button>
                ) : (
                  <Button type="button" size="lg" variant="outline" disabled={busy} onClick={() => setConfirm(true)}>Delete</Button>
                ))}
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
