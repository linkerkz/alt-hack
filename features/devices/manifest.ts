import type { MetadataRoute } from "next";
import { deviceCode, devicePath } from "./paths";
import type { Device } from "./types";

// Цвета экрана устройства (app/globals.css, --color-device-*): манифест и
// иконка CSS не видят.
export const SCREEN = "#0d100f";
export const SCREEN_INK = "#d9e6dc";
export const SCREEN_WARN = "#f2b84b";

const ICON_SIZES = [192, 512];

// Манифест на одно устройство: на домашнем экране — своя иконка, открывается
// сразу на своём экране, без адресной строки, как приложение.
export function deviceManifest(device: Device): MetadataRoute.Manifest {
  const path = devicePath(device);
  return {
    id: path,
    name: `${deviceCode(device)} · ${device.name}`,
    short_name: deviceCode(device),
    description: DESCRIPTION[device.kind],
    start_url: path,
    scope: path,
    display: "standalone",
    orientation: "portrait",
    background_color: SCREEN,
    theme_color: SCREEN,
    lang: "ru",
    icons: ICON_SIZES.map((size) => ({
      src: `/devices/icon/${size}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
}

const DESCRIPTION: Record<Device["kind"], string> = {
  camera: "Камера горловины: замечает предмет в стрелке и сообщает на станцию",
  pager: "Пейджер бригады: наряды службы и чеклист работ",
};
