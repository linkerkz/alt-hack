import { type NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/supabase";

// Чеклист наряда открывают по QR без входа (но не печать наряда).
const PUBLIC_PATHS = [/^\/login$/, /^\/work-orders\/[^/]+$/];

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
