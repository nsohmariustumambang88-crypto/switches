"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { StoreSettings } from "@/lib/data/settings";
import { adminRequest, useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Field, Loading, Notice, Section, TextInput } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

/** /admin/settings — GET/PUT /api/admin/settings */
export default function SettingsAdmin() {
  const { data, error, loading } = useAdmin<{ demo: boolean; settings: StoreSettings }>("/api/admin/settings");
  if (error) return <Notice tone="error">{error}</Notice>;
  if (loading || !data) return <Loading rows={4} />;
  return <SettingsForm initial={data.settings} demo={data.demo} />;
}

function SettingsForm({ initial, demo }: { initial: StoreSettings; demo: boolean }) {
  const [s, setS] = useState(initial);
  const [busy, setBusy] = useState(false);
  const store = (k: keyof StoreSettings["store"], v: string) => setS((x) => ({ ...x, store: { ...x.store, [k]: v } }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminRequest("/api/admin/settings", "PUT", {
        ...s,
        shipping: { freeOver: Number(s.shipping.freeOver), flat: Number(s.shipping.flat), standardDays: Number(s.shipping.standardDays), express: Number(s.shipping.express), expressDays: Number(s.shipping.expressDays) },
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="max-w-3xl space-y-10">
      <AdminTitle title="Settings" />
      {demo && <Notice>Defaults from the code. Saving needs Supabase connected.</Notice>}
      <Section title="Store">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Store name" htmlFor="s-name"><TextInput id="s-name" required value={s.store.name} onChange={(e) => store("name", e.target.value)} /></Field>
          <Field label="Tagline" htmlFor="s-tag"><TextInput id="s-tag" value={s.store.tagline} onChange={(e) => store("tagline", e.target.value)} /></Field>
          <Field label="Support email" htmlFor="s-mail"><TextInput id="s-mail" type="email" value={s.store.supportEmail} onChange={(e) => store("supportEmail", e.target.value)} /></Field>
          <Field label="Support phone" htmlFor="s-phone"><TextInput id="s-phone" value={s.store.supportPhone} onChange={(e) => store("supportPhone", e.target.value)} /></Field>
        </div>
      </Section>
      <Section title="Shipping">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Free shipping over (USD)" htmlFor="s-free">
            <TextInput id="s-free" inputMode="decimal" value={String(s.shipping.freeOver)} onChange={(e) => setS((x) => ({ ...x, shipping: { ...x.shipping, freeOver: e.target.value as unknown as number } }))} />
          </Field>
          <Field label="Standard rate below that (USD)" htmlFor="s-flat">
            <TextInput id="s-flat" inputMode="decimal" value={String(s.shipping.flat)} onChange={(e) => setS((x) => ({ ...x, shipping: { ...x.shipping, flat: e.target.value as unknown as number } }))} />
          </Field>
          <Field label="Standard (discreet): arrives within (days)" htmlFor="s-sdays">
            <TextInput id="s-sdays" inputMode="numeric" value={String(s.shipping.standardDays)} onChange={(e) => setS((x) => ({ ...x, shipping: { ...x.shipping, standardDays: e.target.value as unknown as number } }))} />
          </Field>
          <Field label="Fast-track price (USD)" htmlFor="s-exp" hint="Always charged; not covered by free shipping.">
            <TextInput id="s-exp" inputMode="decimal" value={String(s.shipping.express)} onChange={(e) => setS((x) => ({ ...x, shipping: { ...x.shipping, express: e.target.value as unknown as number } }))} />
          </Field>
          <Field label="Fast-track: arrives within (days)" htmlFor="s-edays">
            <TextInput id="s-edays" inputMode="numeric" value={String(s.shipping.expressDays)} onChange={(e) => setS((x) => ({ ...x, shipping: { ...x.shipping, expressDays: e.target.value as unknown as number } }))} />
          </Field>
        </div>
        <p className="mt-2 text-xs text-ink-2">Orders are priced on the server with these settings; the cart shows an estimate. Delivery days appear on product pages, the shipping page and in Google&apos;s product data, so keep them achievable. United States only.</p>
      </Section>
      <Section title="Preview">
        <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] font-medium">
          <Checkbox checked={s.preview.enabled} onCheckedChange={(c) => setS((x) => ({ ...x, preview: { enabled: !!c } }))} className="mt-0.5" />
          <span>
            Preview build
            <span className="block text-sm font-normal text-ink-2">Marks prices, ratings and shipping terms as placeholders on the storefront.</span>
          </span>
        </label>
      </Section>
      <Button type="submit" size="lg" disabled={busy || demo}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
