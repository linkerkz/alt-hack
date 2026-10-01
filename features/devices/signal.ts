import type { Observation } from "./schemas";

// Ответ станции на сигнал: что сделала система и когда — его показывает
// экран камеры.
export type Reply = { text: string; incidentCode: string | null; at: string };

// Сигнал камеры на сервер — тот же запрос сможет слать и железка.
export async function sendSignal(
  deviceId: string,
  observation: Observation,
): Promise<Reply> {
  const at = new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  try {
    const response = await fetch(`/api/devices/${deviceId}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(observation),
    });
    if (!response.ok) {
      return { text: "Станция не приняла сигнал", incidentCode: null, at };
    }
    const body: { text: string; incidentCode: string | null } =
      await response.json();
    return { ...body, at };
  } catch {
    return { text: "Нет связи со станцией", incidentCode: null, at };
  }
}
