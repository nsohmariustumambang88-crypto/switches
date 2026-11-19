import { admin, adminWrite, body, isResponse } from "@/lib/api";
import { getSettings } from "@/lib/data/settings";
import { saveSettings, settingsInput } from "@/lib/data/admin";

/** GET /api/admin/settings */
export async function GET() {
  const gate = await admin();
  if (isResponse(gate)) return gate;
  return Response.json({ demo: gate.demo, settings: await getSettings() });
}

/** PUT /api/admin/settings — { store, shipping, preview }. */
export async function PUT(req: Request) {
  const gate = await adminWrite();
  if (isResponse(gate)) return gate;
  const data = await body(req, settingsInput);
  if (isResponse(data)) return data;
  await saveSettings(data);
  return Response.json({ settings: data });
}
