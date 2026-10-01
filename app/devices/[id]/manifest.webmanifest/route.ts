import { deviceManifest } from "@/features/devices/manifest";
import { getDevice } from "@/features/devices/queries";

// Манифест PWA своего устройства: ставится на экран и открывается на нём.
export async function GET(
  _request: Request,
  context: RouteContext<"/devices/[id]/manifest.webmanifest">,
) {
  const device = await getDevice((await context.params).id);
  if (device == null) return new Response("Not found", { status: 404 });
  return Response.json(deviceManifest(device), {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
