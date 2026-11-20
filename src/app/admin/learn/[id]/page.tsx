import { Suspense } from "react";
import { Loading } from "@/components/admin/admin-ui";
import { EditGuide } from "./edit-guide";

export default function Page({ params }: PageProps<"/admin/learn/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      {params.then(({ id }) => (
        <EditGuide id={id} />
      ))}
    </Suspense>
  );
}
