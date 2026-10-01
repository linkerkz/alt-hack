// Полевое устройство станции: камера следит за объектом, пейджер показывает
// бригаде наряд её службы. Доступ к устройству даёт его uuid в ссылке.
export type Device = Camera | Pager;

export type Camera = DeviceBase & {
  kind: "camera";
  // Объект наблюдения: «С3».
  objectId: string;
};

export type Pager = DeviceBase & {
  kind: "pager";
  service: Service;
};

type DeviceBase = {
  id: string;
  stationId: string;
  name: string;
};

// Совпадает с check у work_orders.service и devices.service.
export type Service = "signalling" | "track" | "power";

// Что видит камера в зоне объекта.
export type CameraState = "obstruction" | "clear";
