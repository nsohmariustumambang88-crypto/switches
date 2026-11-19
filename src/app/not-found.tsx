import { EmptyState } from "@/components/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      figure="404"
      title="Page not found"
      body="That page doesn’t exist or has moved."
      href="/"
      cta="Back to the store"
    />
  );
}
