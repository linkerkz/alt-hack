import { ImageResponse } from "next/og";
import { SCREEN, SCREEN_INK, SCREEN_WARN } from "@/features/devices/manifest";

// Иконка устройства на домашнем экране: путь с жёлтыми шпалами на тёмном экране.
// 180 — для iOS, 192 и 512 — для манифеста.
// Размеров три — рисуем их при сборке, остальные адреса отдают 404.
const SIZES = [180, 192, 512];

export const dynamicParams = false;

export function generateStaticParams() {
  return SIZES.map((size) => ({ size: String(size) }));
}

export async function GET(
  _request: Request,
  context: RouteContext<"/devices/icon/[size]">,
) {
  const size = Number((await context.params).size);

  const unit = size / 16;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: SCREEN,
      }}
    >
      <div
        style={{
          position: "relative",
          width: unit * 8,
          height: unit * 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        {[0, 1, 2, 3].map((sleeper) => (
          <div
            key={sleeper}
            style={{
              height: unit * 0.9,
              background: SCREEN_WARN,
              borderRadius: unit / 4,
            }}
          />
        ))}
        {[unit * 1.6, unit * 5.6].map((left) => (
          <div
            key={left}
            style={{
              position: "absolute",
              left,
              top: 0,
              width: unit * 0.8,
              height: unit * 10,
              background: SCREEN_INK,
            }}
          />
        ))}
      </div>
    </div>,
    { width: size, height: size },
  );
}
