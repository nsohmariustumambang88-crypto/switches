import { Suspense } from "react";
import { Loading } from "@/components/admin/admin-ui";
import { EditProduct } from "./edit-product";

export default function Page({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      {params.then(({ id }) => (
        <EditProduct id={id} />
      ))}
    </Suspense>
  );
}
