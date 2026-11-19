"use client";

import { toast } from "sonner";
import { money, formatDay } from "@/lib/format";
import type { Customer } from "@/lib/data/admin";
import { useStore } from "@/lib/store";
import { adminRequest, useAdmin } from "@/components/admin/use-admin";
import { AdminTitle, Loading, Notice, Select } from "@/components/admin/admin-ui";

/** /admin/customers — GET /api/admin/customers, PATCH /api/admin/customers/:id */
export default function CustomersAdmin() {
  const { data, error, loading, reload } = useAdmin<{ demo: boolean; customers: Customer[] }>("/api/admin/customers");
  const me = useStore((s) => s.viewer?.id);

  const setRole = async (c: Customer, role: string) => {
    try {
      await adminRequest(`/api/admin/customers/${c.id}`, "PATCH", { role });
      toast.success(`${c.email} is now ${role === "admin" ? "an admin" : "a customer"}`);
      reload();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <AdminTitle title="Customers" meta={data ? `${data.customers.length} accounts` : undefined} />
      {error && <Notice tone="error">{error}</Notice>}
      {loading && !data && <Loading />}
      {data?.demo && <Notice>Customer accounts appear here once Supabase Auth is connected.</Notice>}
      {data && !data.demo && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="py-2 pr-4 label-caps text-ink-2">Customer</th>
                <th scope="col" className="py-2 pr-4 text-right label-caps text-ink-2">Orders</th>
                <th scope="col" className="py-2 pr-4 text-right label-caps text-ink-2">Spent</th>
                <th scope="col" className="py-2 pr-4 label-caps text-ink-2">Joined</th>
                <th scope="col" className="py-2 label-caps text-ink-2">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/12">
              {data.customers.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 pr-4">
                    <span className="block font-semibold">{c.fullName || "—"}</span>
                    <span className="text-xs text-ink-2">{c.email}</span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{c.orders}</td>
                  <td className="py-3 pr-4 text-right font-semibold tabular-nums">{money(c.spent)}</td>
                  <td className="py-3 pr-4 text-ink-2">{formatDay(c.joined)}</td>
                  <td className="w-40 py-3">
                    <Select
                      aria-label={`Role for ${c.email}`}
                      value={c.role}
                      disabled={c.id === me}
                      onChange={(e) => setRole(c, e.target.value)}
                      options={[
                        { value: "customer", label: "Customer" },
                        { value: "admin", label: "Admin" },
                      ]}
                      className="h-9"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data.customers.length && <p className="rounded-lg bg-surface p-6 text-sm text-ink-2">No accounts yet.</p>}
        </div>
      )}
    </>
  );
}
