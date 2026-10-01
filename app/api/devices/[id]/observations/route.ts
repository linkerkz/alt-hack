import { analyzeSnapshot } from "@/features/devices/analysis";
import { markSeen } from "@/features/devices/presence";
import { getDevice } from "@/features/devices/queries";
import { parseObservation } from "@/features/devices/schemas";
import { reportCamera } from "@/features/station-console/camera";

// Приём сигнала камеры: клиент вне приложения — телефон с камерой, а позже
// и железка (ESP32) тем же запросом. Доступ даёт uuid устройства в адресе.
// Роут только склеивает фичи: устройство и ИИ по кадру — devices, инцидент —
// пульт станции.
export async function POST(
  request: Request,
  context: RouteContext<"/api/devices/[id]/observations">,
) {
  const { id } = await context.params;
  const device = await getDevice(id);
  if (device == null || device.kind !== "camera") {
    return Response.json({ error: "Камера не найдена" }, { status: 404 });
  }
  const observation = parseObservation(await request.json().catch(() => null));
  if (observation == null) {
    return Response.json({ error: "Сигнал не распознан" }, { status: 400 });
  }

  try {
    await markSeen(device.id);
    const verdict = await analyzeSnapshot(
      observation.snapshot,
      device.objectId,
    );
    const reply = await reportCamera(device.stationId, {
      deviceId: device.id,
      ...observation,
      // ИИ согласен с камерой: видит предмет, когда камера сообщает о нём.
      ai:
        verdict == null
          ? null
          : {
              agrees:
                verdict.obstruction === (observation.state === "obstruction"),
              summary: verdict.summary,
            },
    });
    return Response.json(reply);
  } catch {
    return Response.json({ error: "Не удалось сохранить" }, { status: 500 });
  }
}
