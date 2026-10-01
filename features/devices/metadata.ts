import type { Metadata, Viewport } from "next";
import { SCREEN } from "./manifest";
import { deviceCode } from "./paths";
import type { Device } from "./types";

// Метаданные экрана устройства: свой манифест PWA, иконка и заголовок для
// домашнего экрана iOS.
export function deviceMetadata(device: Device | null): Metadata {
  if (device == null) return { title: "Устройство" };
  const code = deviceCode(device);
  return {
    title: `${code} · ${device.name}`,
    description: device.name,
    manifest: `/devices/${device.id}/manifest.webmanifest`,
    appleWebApp: { capable: true, title: code, statusBarStyle: "black" },
    icons: { apple: "/devices/icon/180" },
  };
}

// Во весь экран под вырез, панели браузера — цвета экрана устройства.
export const DEVICE_VIEWPORT: Viewport = {
  themeColor: SCREEN,
  viewportFit: "cover",
};
