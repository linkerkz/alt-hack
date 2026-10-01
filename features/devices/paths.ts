import type { Device } from "./types";

// Адрес экрана устройства: /camera/{id} или /pager/{id}.
export function devicePath(device: Device) {
  return `/${device.kind}/${device.id}`;
}

// Код устройства в строке статуса: «CAM-01», «PGR-02» — по хвосту uuid.
export function deviceCode(device: Device) {
  const serial = Number.parseInt(device.id.slice(-4), 16) % 100;
  return `${CODE_PREFIX[device.kind]}-${String(serial).padStart(2, "0")}`;
}

const CODE_PREFIX: Record<Device["kind"], string> = {
  camera: "CAM",
  pager: "PGR",
};
