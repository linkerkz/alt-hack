import { ImageResponse } from "next/og";
import { ACCENT, INK, PAPER } from "@/features/devices/manifest";

// Иконка устройства на домашнем экране: путь с золотыми шпалами на бумаге.
// 180 — для iOS, 192 и 512 — для манифеста.
const SIZES = [180, 192, 512];

export async function GET(
  _request: Request,
  context: RouteContext<"/devices/icon/[size]">,
) {
  const size = Number((await context.params).size);
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });

  const unit = size / 16;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PAPER,
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
              background: ACCENT,
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
              background: INK,
            }}
          />
        ))}
      </div>
    </div>,
    { width: size, height: size },
  );
}
