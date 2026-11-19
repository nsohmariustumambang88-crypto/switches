"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Landmark, Lock, MapPin, Store, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { dealerAddress, demoDealers, sortDealersByZip, type Dealer, type Order } from "@/lib/catalog";
import { US_STATES, formatCard, formatExpiry, stateFromZip } from "@/lib/us";
import { money } from "@/lib/format";
import { linePrice, totals, useProductLookup, useStore } from "@/lib/store";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { site } from "@/config/site";
import { PageBar } from "@/components/page-bar";
import { PageTitle } from "@/components/page-title";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const STEPS = ["Shipping", "Payment", "Confirm"] as const;

type Address = { name: string; line1: string; city: string; state: string; zip: string };

/** Local-only order id + timestamp, used when Supabase isn't connected yet. */
function newOrderStamp() {
  return {
    id: "CB" + String(Math.floor(10000 + Math.random() * 89999)),
    now: new Date().toISOString(),
  };
}

const field =
  "h-12 rounded-lg border-transparent bg-surface px-3.5 text-[0.9375rem] focus-visible:border-ink focus-visible:ring-0";

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useStore((s) => s.hydrated);
  const cart = useStore((s) => s.cart);
  const viewer = useStore((s) => s.viewer);
  const placeOrder = useStore((s) => s.placeOrder);
  const clearSelected = useStore((s) => s.removeSelected);
  const find = useProductLookup();
  const { lines, subtotal, shipping, total, hasFirearm } = totals(cart, find);

  const saved = useStore((s) => s.savedCheckout);
  const saveCheckout = useStore((s) => s.saveCheckout);

  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(true);
  const [addr, setAddr] = useState<Address>({ name: "", line1: "", city: "", state: "", zip: "" });
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [allDealers, setAllDealers] = useState<Dealer[]>(demoDealers);
  const [sampleDealers, setSampleDealers] = useState(true);
  const [dealer, setDealer] = useState<string>("");
  const [pay, setPay] = useState<"card" | "ach">("card");
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  const [remember, setRemember] = useState(true);
  const [attest, setAttest] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Autofill once the local store has loaded: this device's last checkout,
  // then the signed-in account's name/email. Saved details open collapsed.
  const [prefilled, setPrefilled] = useState(false);
  if (hydrated && !prefilled) {
    setPrefilled(true);
    if (saved) {
      setAddr({ name: saved.name, line1: saved.line1, city: saved.city, state: saved.state, zip: saved.zip });
      setPhone(saved.phone);
      setEmail(saved.email);
      setDealer(saved.dealerId);
      setPay(saved.pay);
      if (saved.name && saved.line1 && saved.city && saved.state && saved.zip) setEditing(false);
    } else if (viewer?.fullName) {
      setAddr((a) => ({ ...a, name: viewer.fullName ?? "" }));
    }
  }

  // GET /api/ffl-dealers once — a static, CDN-cached list; sorted by ZIP here.
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/ffl-dealers", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { sample: boolean; dealers: Dealer[] }) => {
        setAllDealers(d.dealers);
        setSampleDealers(d.sample);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);
  const zip = addr.zip.replace(/\D/g, "").slice(0, 5);
  const dealers = useMemo(() => sortDealersByZip(allDealers, zip), [allDealers, zip]);

  const setZip = (value: string) => {
    const next = value.replace(/[^\d-]/g, "").slice(0, 10);
    const inferred = !addr.state ? stateFromZip(next) : null;
    setAddr((a) => ({ ...a, zip: next, ...(inferred ? { state: inferred } : {}) }));
  };

  const contactEmail = viewer?.email ?? email;
  const chosen = dealers.find((d) => d.id === dealer);

  const bar = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!bar.current) return;
      gsap.to(bar.current, {
        scaleX: step / (STEPS.length - 1),
        duration: prefersReducedMotion() ? 0 : 0.8,
        ease: "expo.out",
      });
    },
    { dependencies: [step] }
  );

  const addrComplete = Object.values(addr).every((v) => v.trim());

  const next = () => {
    const errs: string[] = [];
    if (step === 0) {
      if (!addrComplete) errs.push("Enter your full billing and contact address.");
      if (!/^\S+@\S+\.\S+$/.test(contactEmail)) errs.push("Enter an email for order updates.");
      if (hasFirearm && !dealer) errs.push("Choose an FFL dealer to receive the firearm.");
      if (addrComplete) setEditing(false);
    }
    if (step === 2 && !attest) errs.push(`Confirm you are ${site.minimumAge} or older and legally allowed to buy these items.`);
    setErrors(errs);
    if (errs.length) return;
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    void submit();
  };

  // POST /api/orders. Falls back to a local-only order while Supabase isn't connected (503).
  const submit = async () => {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: contactEmail,
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty, rounds: l.rounds })),
          billing: { ...addr, state: addr.state.toUpperCase(), ...(phone.trim() ? { phone: phone.trim() } : {}) },
          fflDealerId: hasFirearm ? dealer : undefined,
          payment: pay,
          attested: true,
        }),
      });
      const data = await res.json();
      let order: Order;
      if (res.ok) {
        order = data.order;
      } else if (res.status === 503) {
        const { id, now } = newOrderStamp();
        const ffl = dealers.find((d) => d.id === dealer);
        order = {
          id,
          date: now,
          status: "placed",
          items: lines.map((l) => ({ slug: l.slug, qty: l.qty, rounds: l.rounds })),
          ffl: hasFirearm && ffl ? { name: ffl.name, address: dealerAddress(ffl) } : undefined,
          carrier: "Pending",
          tracking: "—",
          events: [
            { status: "placed", at: now },
            { status: "shipped", at: null },
            { status: "at-ffl", at: null },
            { status: "complete", at: null },
          ],
        };
      } else {
        setErrors([data.error ?? "Could not place the order."]);
        setPlacing(false);
        return;
      }
      placeOrder(order);
      clearSelected();
      // Remember (or forget) these details on this device for next time.
      saveCheckout(remember ? { ...addr, phone, email: contactEmail, dealerId: dealer, pay } : null);
      toast.success("Order placed", { description: `Order #${order.id}` });
      router.push(`/orders/${order.id}`);
    } catch {
      setErrors(["Network error — check your connection and try again."]);
      setPlacing(false);
    }
  };

  if (!hydrated) return <PageBar title="Checkout" back="/cart" />;
  if (!lines.length && !placing) {
    return (
      <>
        <PageBar title="Checkout" back="/cart" />
        <EmptyState figure="0" title="Nothing to check out" body="Select items in your cart first." href="/cart" cta="Back to cart" />
      </>
    );
  }

  const cta =
    step === 0 ? "Continue to payment" : step === 1 ? "Review order" : `Pay now — ${money(total)}`;

  return (
    <>
      <PageBar title="" back="/cart" />
      <div className="mx-auto max-w-[90rem] px-4 md:px-6 lg:px-10">
        <PageTitle title="Checkout" />

        {/* Stepper (kit screen 8): squared nodes on a rule that fills as you advance. */}
        <ol className="relative mx-auto mb-8 grid max-w-md grid-cols-3 md:mx-0 md:mb-12">
          <div aria-hidden="true" className="absolute top-4 right-[16.66%] left-[16.66%] h-[2px] bg-ink/15">
            <div ref={bar} className="h-full origin-left scale-x-0 bg-ink" />
          </div>
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s} className="relative flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => i < step && setStep(i)}
                  aria-current={current ? "step" : undefined}
                  aria-label={`${s}${done ? " (done)" : ""}`}
                  className={cn(
                    "grid size-8 place-items-center rounded-lg text-sm font-extrabold transition-colors duration-300",
                    done || current ? "bg-ink text-primary-foreground" : "bg-surface text-ink-2",
                    done && "cursor-pointer"
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                </button>
                <span className={cn("text-xs font-bold", current ? "text-ink" : "text-ink-2")}>{s}</span>
              </li>
            );
          })}
        </ol>

        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="space-y-8 md:col-span-7 lg:col-span-8">
            {step === 0 && (
              <>
                <section aria-labelledby="addr-h">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 id="addr-h" className="text-lg font-extrabold">
                      {hasFirearm ? "Billing address" : "Shipping address"}
                    </h2>
                    {!editing && (
                      <button type="button" onClick={() => setEditing(true)} className="cursor-pointer text-sm font-bold underline">
                        Change
                      </button>
                    )}
                  </div>
                  {editing ? (
                    // Section-scoped autocomplete tokens let the browser fill the whole block in one tap.
                    <div className="grid grid-cols-6 gap-3">
                      <div className="col-span-6">
                        <Label htmlFor="a-name" className="mb-1.5 block text-xs font-bold text-ink-2">Full name</Label>
                        <Input id="a-name" name="name" autoComplete="billing name" enterKeyHint="next" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} className={field} />
                      </div>
                      <div className="col-span-6">
                        <Label htmlFor="a-line1" className="mb-1.5 block text-xs font-bold text-ink-2">Street address</Label>
                        <Input id="a-line1" name="address" autoComplete="billing street-address" enterKeyHint="next" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} className={field} />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <Label htmlFor="a-city" className="mb-1.5 block text-xs font-bold text-ink-2">City</Label>
                        <Input id="a-city" name="city" autoComplete="billing address-level2" enterKeyHint="next" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className={field} />
                      </div>
                      <div className="col-span-3 md:col-span-1">
                        <Label htmlFor="a-state" className="mb-1.5 block text-xs font-bold text-ink-2">State</Label>
                        <select
                          id="a-state"
                          name="state"
                          autoComplete="billing address-level1"
                          value={addr.state}
                          onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                          className={cn(field, "w-full cursor-pointer px-3 outline-none focus:ring-2 focus:ring-ink")}
                        >
                          <option value="">—</option>
                          {US_STATES.map((s) => (
                            <option key={s.code} value={s.code}>{s.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <Label htmlFor="a-zip" className="mb-1.5 block text-xs font-bold text-ink-2">ZIP</Label>
                        <Input id="a-zip" name="zip" inputMode="numeric" autoComplete="billing postal-code" enterKeyHint="next" value={addr.zip} onChange={(e) => setZip(e.target.value)} className={field} />
                      </div>
                      {!viewer && (
                        <div className="col-span-6 md:col-span-3">
                          <Label htmlFor="a-email" className="mb-1.5 block text-xs font-bold text-ink-2">Email for order updates</Label>
                          <Input id="a-email" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                        </div>
                      )}
                      <div className={cn("col-span-6", !viewer && "md:col-span-3")}>
                        <Label htmlFor="a-tel" className="mb-1.5 block text-xs font-bold text-ink-2">Phone (optional — for the FFL dealer)</Label>
                        <Input id="a-tel" name="tel" type="tel" inputMode="tel" autoComplete="billing tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
                      </div>
                      <label className="col-span-6 flex cursor-pointer items-center gap-3 pt-1 text-sm">
                        <Checkbox checked={remember} onCheckedChange={(c) => setRemember(!!c)} />
                        Remember these details on this device for faster checkout
                      </label>
                    </div>
                  ) : (
                    <div className="flex gap-3 rounded-lg bg-surface p-4">
                      <MapPin className="mt-0.5 size-5 shrink-0" />
                      <p className="text-sm leading-relaxed">
                        <strong className="block">{addr.name}</strong>
                        {addr.line1}, {addr.city}, {addr.state} {addr.zip}
                        {(viewer?.email ?? email) && <span className="block text-ink-2">{viewer?.email ?? email}{phone ? ` · ${phone}` : ""}</span>}
                      </p>
                    </div>
                  )}
                </section>

                {hasFirearm && (
                  <section aria-labelledby="ffl-h">
                    <h2 id="ffl-h" className="text-lg font-extrabold">FFL dealer</h2>
                    <p className="mt-1 mb-4 max-w-prose text-sm leading-relaxed text-ink-2">
                      Firearms ship to a licensed dealer, not to your home. Pick one near you; you’ll
                      complete Form 4473 and the background check when you collect.
                    </p>
                    <RadioGroup value={dealer} onValueChange={(v) => setDealer(v as string)} className="gap-2">
                      {dealers.map((d, i) => (
                        <Label
                          key={d.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                            dealer === d.id ? "border-ink bg-surface-2" : "border-transparent bg-surface hover:bg-surface-2"
                          )}
                        >
                          <RadioGroupItem value={d.id} className="mt-0.5" />
                          <Store className="size-5 shrink-0" />
                          <span className="text-sm leading-snug">
                            <strong className="block">
                              {d.name}
                              {saved?.dealerId === d.id ? (
                                <span className="ml-2 inline-flex h-5 items-center rounded-[3px] border border-ink px-1.5 align-middle text-[0.625rem] font-bold uppercase">Last used</span>
                              ) : i === 0 && zip.length === 5 ? (
                                <span className="ml-2 inline-flex h-5 items-center rounded-[3px] bg-ink px-1.5 align-middle text-[0.625rem] font-bold text-primary-foreground uppercase">Nearest</span>
                              ) : null}
                            </strong>
                            <span className="text-ink-2">{dealerAddress(d)}</span>
                            <span className="mt-1 block text-xs text-ink-2">
                              {d.transferFee != null ? `Transfer fee ${money(d.transferFee)}` : "Transfer fee set by dealer"}
                            </span>
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                    <p className="mt-3 text-xs text-ink-2">
                      {sampleDealers
                        ? "Sample dealers for the demo — real dealers load from the database once Supabase is connected."
                        : "Sorted by your ZIP code. Don’t see your dealer? Contact us and we’ll add them."}
                    </p>
                  </section>
                )}
              </>
            )}

            {step === 1 && (
              <section aria-labelledby="pay-h">
                <h2 id="pay-h" className="mb-4 text-lg font-extrabold">Payment method</h2>
                <RadioGroup value={pay} onValueChange={(v) => setPay(v as "card" | "ach")} className="gap-2">
                  {(
                    [
                      ["card", "Credit / debit card", CreditCard],
                      ["ach", "Bank transfer (ACH / eCheck)", Landmark],
                    ] as const
                  ).map(([id, label, Icon]) => (
                    <Label
                      key={id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-[0.9375rem] font-semibold transition-colors",
                        pay === id ? "border-ink bg-surface-2" : "border-transparent bg-surface hover:bg-surface-2"
                      )}
                    >
                      <RadioGroupItem value={id} />
                      <Icon className="size-5" />
                      {label}
                    </Label>
                  ))}
                </RadioGroup>
                {pay === "card" ? (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="cc" className="mb-1.5 block text-xs font-bold text-ink-2">Card number</Label>
                      <Input id="cc" name="cardnumber" inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} className={cn(field, "tabular-nums")} />
                    </div>
                    <div>
                      <Label htmlFor="exp" className="mb-1.5 block text-xs font-bold text-ink-2">Expiry</Label>
                      <Input id="exp" name="cc-exp" inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: formatExpiry(e.target.value) })} className={cn(field, "tabular-nums")} />
                    </div>
                    <div>
                      <Label htmlFor="cvc" className="mb-1.5 block text-xs font-bold text-ink-2">CVC</Label>
                      <Input id="cvc" name="cvc" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} className={cn(field, "tabular-nums")} />
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-relaxed text-ink-2">You’ll link your bank account securely after placing the order.</p>
                )}
                <p className="mt-4 flex items-center gap-2 text-xs text-ink-2">
                  <Lock className="size-3.5" />
                  Demo checkout — no payment processor is connected and no card is charged.
                </p>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="rev-h" className="space-y-5">
                <h2 id="rev-h" className="text-lg font-extrabold">Review</h2>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-lg bg-surface p-4">
                    <dt className="label-caps text-ink-2">{hasFirearm ? "Billing" : "Ship to"}</dt>
                    <dd className="mt-2 leading-relaxed">
                      <strong className="block">{addr.name}</strong>
                      {addr.line1}, {addr.city}, {addr.state} {addr.zip}
                    </dd>
                  </div>
                  {hasFirearm && (
                    <div className="rounded-lg bg-surface p-4">
                      <dt className="label-caps text-ink-2">Firearm ships to</dt>
                      <dd className="mt-2 leading-relaxed">
                        <strong className="block">{chosen?.name}</strong>
                        {chosen ? dealerAddress(chosen) : null}
                      </dd>
                    </div>
                  )}
                  <div className="rounded-lg bg-surface p-4">
                    <dt className="label-caps text-ink-2">Payment</dt>
                    <dd className="mt-2">{pay === "card" ? "Credit / debit card" : "Bank transfer (ACH)"}</dd>
                  </div>
                </dl>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-4 text-sm leading-relaxed">
                  <Checkbox checked={attest} onCheckedChange={(c) => setAttest(!!c)} className="mt-0.5" />
                  <span>
                    I confirm I am {site.minimumAge} or older, I am not prohibited from buying firearms
                    or ammunition, and these items are legal where I live.
                  </span>
                </label>
              </section>
            )}

            {errors.length > 0 && (
              <div role="alert" className="flex gap-3 rounded-lg bg-danger p-4 text-sm text-primary-foreground">
                <TriangleAlert className="mt-0.5 size-5 shrink-0" />
                <ul className="space-y-1">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="md:col-span-5 lg:col-span-4">
            <div className="md:sticky md:top-24">
              <h2 className="mb-3 text-lg font-extrabold">Order summary</h2>
              <ul className="divide-y divide-ink/12 border-y border-ink/12">
                {lines.map((l) => {
                  const p = find(l.slug)!;
                  return (
                    <li key={l.key} className="flex justify-between gap-4 py-3 text-sm">
                      <span className="min-w-0">
                        <span className="line-clamp-1 font-semibold">{p.name}</span>
                        <span className="text-xs text-ink-2">
                          Qty {l.qty}
                          {l.rounds ? ` · ${l.rounds} rds` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{money(linePrice(l, find) * l.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-2">Subtotal</dt><dd className="tabular-nums">{money(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-2">Shipping</dt><dd className="tabular-nums">{shipping ? money(shipping) : "Free"}</dd></div>
                <div className="flex justify-between border-t border-ink pt-3 text-lg font-extrabold"><dt>Total</dt><dd className="tabular-nums">{money(total)}</dd></div>
              </dl>
              <div className="fixed inset-x-0 bottom-0 z-30 bg-ground/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:static md:mt-6 md:bg-transparent md:p-0 md:backdrop-blur-none">
                <Button size="xl" className="w-full" onClick={next} disabled={placing}>
                  {step === 2 && <Lock className="size-4" />}
                  {placing ? "Placing order…" : cta}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
