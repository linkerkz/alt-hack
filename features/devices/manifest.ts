import type { MetadataRoute } from "next";
import type { Device } from "./types";

// Цвета бумаги и акцента темы Classical (app/globals.css): манифест не видит CSS.
export const PAPER = "#f3f2f2";
export const ACCENT = "#b68235";
export const INK = "#201f1d";

const ICON_SIZES = [192, 512];

// Манифест PWA на одно устройство: ставится на домашний экран и открывается
// сразу на своей странице, без адресной строки — как приложение.
export function deviceManifest(device: Device): MetadataRoute.Manifest {
  const path = `/devices/${device.id}`;
  return {
    id: path,
    name: device.name,
    short_name: SHORT_NAME[device.kind],
    description: DESCRIPTION[device.kind],
    start_url: path,
    scope: path,
    display: "standalone",
    orientation: "portrait",
    background_color: PAPER,
    theme_color: PAPER,
    lang: "ru",
    icons: ICON_SIZES.map((size) => ({
      src: `/devices/icon/${size}`,
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any",
    })),
  };
}

const SHORT_NAME: Record<Device["kind"], string> = {
  camera: "Камера",
  pager: "Пейджер",
};

const DESCRIPTION: Record<Device["kind"], string> = {
  camera: "Камера горловины: замечает предмет в стрелке и сообщает на пульт",
  pager: "Пейджер бригады: наряды службы и чеклист работ",
};
