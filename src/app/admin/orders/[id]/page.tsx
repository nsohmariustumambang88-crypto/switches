import { Suspense } from "react";
import { Loading } from "@/components/admin/admin-ui";
import { OrderDetail } from "./order-detail";

export default function Page({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      {params.then(({ id }) => (
        <OrderDetail id={id} />
      ))}
    </Suspense>
  );
}
