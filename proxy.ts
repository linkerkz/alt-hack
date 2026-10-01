import { type NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/supabase";

// Полевые устройства работают без входа: экраны камеры и пейджера, их
// манифест и иконки PWA, приём сигнала камеры. Доступ даёт uuid, сессия им
// не нужна — её даже не продлеваем: пейджер ходит сюда раз в 3 с.
const DEVICE_PATHS = [
  /^\/(camera|pager)\/[0-9a-f-]{36}$/,
  /^\/devices\/[0-9a-f-]{36}\/manifest\.webmanifest$/,
  /^\/devices\/icon\/\d+$/,
  /^\/api\/devices\/[0-9a-f-]{36}\/observations$/,
];

// Открыты без входа, но сессию продлеваем: вход и чеклист наряда по QR
// (но не его печать) может открыть и вошедший диспетчер.
const PUBLIC_PATHS = [/^\/login$/, /^\/work-orders\/[^/]+$/];

// Только вход: без сессии — на /login. Права по роли проверяют страницы.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (DEVICE_PATHS.some((path) => path.test(pathname))) {
    return NextResponse.next();
  }

  const { response, isSignedIn } = await refreshSession(request);
  const isPublic = PUBLIC_PATHS.some((path) => path.test(pathname));
  if (!isSignedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
