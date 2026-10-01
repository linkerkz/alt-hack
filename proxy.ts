import { type NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/supabase";

// По QR без входа: чеклист наряда (но не его печать) и полевые устройства —
// экраны камеры и пейджера, их манифест и иконки PWA, приём сигнала камеры.
// Доступ даёт uuid.
const PUBLIC_PATHS = [
  /^\/login$/,
  /^\/work-orders\/[^/]+$/,
  /^\/(camera|pager)\/[0-9a-f-]{36}$/,
  /^\/devices\/[0-9a-f-]{36}\/manifest\.webmanifest$/,
  /^\/devices\/icon\/\d+$/,
  /^\/api\/devices\/[0-9a-f-]{36}\/observations$/,
];

// Только вход: без сессии — на /login. Права по роли проверяют страницы.
export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await refreshSession(request);
  const { pathname } = request.nextUrl;
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
