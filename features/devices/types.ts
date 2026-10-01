// Полевое устройство станции: камера следит за объектом, пейджер показывает
// бригаде вызовы и задачи ДСП. Доступ к устройству даёт его uuid в ссылке.
export type Device = Camera | Pager;

export type Camera = DeviceBase & {
  kind: "camera";
  // Объект наблюдения: «С3».
  objectId: string;
};

export type Pager = DeviceBase & { kind: "pager" };

type DeviceBase = {
  id: string;
  stationId: string;
  name: string;
};

// Сообщение на пейджере: вызов по инциденту или обычная задача ДСП.
export type PagerMessage = {
  id: string;
  // Вызов к стрелке; иначе — обычная задача.
  isCall: boolean;
  text: string;
  status: PagerMessageStatus;
  createdAt: string;
};

// Совпадает с enum public.pager_message_status.
export type PagerMessageStatus =
  | "sent"
  | "accepted"
  | "done"
  | "escalated"
  | "cancelled";

// Ответ бригады с пейджера.
export type PagerAnswer = "accepted" | "done" | "escalated";

// Что видит камера в зоне объекта.
export type CameraState = "obstruction" | "clear";
