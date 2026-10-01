import { getSnapshot } from "@/features/station-console/snapshot";

// Снимок камеры для карточки инцидента. Снимок инцидента не меняется, поэтому
// браузер хранит его, пока жив кэш.
export async function GET(
  _request: Request,
  context: RouteContext<"/incidents/[id]/snapshot">,
) {
  const snapshot = await getSnapshot((await context.params).id);
  if (snapshot == null) return new Response(null, { status: 404 });
  return new Response(snapshot, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
