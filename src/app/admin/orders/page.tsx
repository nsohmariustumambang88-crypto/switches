import type { Metadata } from "next";
import { Suspense } from "react";
import { Loading } from "@/components/admin/admin-ui";
import { OrdersAdmin } from "./orders-admin";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <OrdersAdmin />
    </Suspense>
  );
}
