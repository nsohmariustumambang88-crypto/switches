"use client";

import { useCallback, useEffect, useState } from "react";

/** GET an admin endpoint; exposes data, error, loading and reload(). */
export function useAdmin<T>(url: string | null) {
  const [tick, setTick] = useState(0);
  const key = url ? `${url}#${tick}` : null;
  // Results are stored with the request key they answer; loading is derived.
  const [state, setState] = useState<{ key: string | null; data: T | null; error: string | null }>({
    key: null,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!url || !key) return;
    let cancelled = false;
    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (cancelled) return;
        setState((s) =>
          r.ok
            ? { key, data: body as T, error: null }
            : { key, data: s.data, error: body.error ?? `Request failed (${r.status})` }
        );
      })
      .catch(() => !cancelled && setState((s) => ({ key, data: s.data, error: "Network error" })));
    return () => {
      cancelled = true;
    };
  }, [url, key]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const settled = state.key === key;
  return {
    data: state.data,
    error: settled ? state.error : null,
    loading: !!url && !settled,
    reload,
  };
}

/** JSON request to an admin endpoint. Throws Error(message) on failure. */
export async function adminRequest<T = unknown>(url: string, method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const issues = (data.issues as { path: string; message: string }[] | undefined)
      ?.map((i) => `${i.path}: ${i.message}`)
      .join("; ");
    throw new Error(issues ? `${data.error} ${issues}` : (data.error ?? `Request failed (${res.status})`));
  }
  return data as T;
}

/** Browser → Cloudinary signed upload (signature from POST /api/admin/media/sign). Returns the public id. */
export async function uploadImage(file: File): Promise<string> {
  const sig = await adminRequest<{
    timestamp: number;
    folder: string;
    tags: string;
    signature: string;
    apiKey: string;
    uploadUrl: string;
  }>("/api/admin/media/sign", "POST");
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("folder", sig.folder);
  form.append("tags", sig.tags);
  form.append("signature", sig.signature);
  const res = await fetch(sig.uploadUrl, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Upload failed");
  return data.public_id as string;
}
