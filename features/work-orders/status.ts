import type { Tone } from "@/components/ui/tone";
import type { Service, WorkOrderStatus } from "./types";

export const STATUS_BADGE: Record<
  WorkOrderStatus,
  { label: string; tone: Tone }
> = {
  issued: { label: "Выдан", tone: "warning" },
  in_progress: { label: "В работе", tone: "warning" },
  done: { label: "Работы выполнены", tone: "normal" },
  returned: { label: "Объект в эксплуатации", tone: "normal" },
};

export const SERVICE_LABEL: Record<Service, string> = {
  signalling: "Служба СЦБ",
  track: "Путейская служба",
  power: "Служба электроснабжения",
};

// Пока наряд открыт, рабочий отмечает пункты; после «выполнено» — только просмотр.
export function isOpen(status: WorkOrderStatus) {
  return status === "issued" || status === "in_progress";
}

// «14:21» — время отметки в часовом поясе станции.
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
}
