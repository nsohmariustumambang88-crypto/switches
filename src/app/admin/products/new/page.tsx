import { Suspense } from "react";
import { Loading } from "@/components/admin/admin-ui";
import { NewProduct } from "./new-product";

/** /admin/products/new[?from=<id>] — reads ?from=, so the client part sits in Suspense. */
export default function Page() {
  return (
    <Suspense fallback={<Loading rows={4} />}>
      <NewProduct />
    </Suspense>
  );
}
