import { type NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/lib/supabase";

// Только вход: без сессии — на /login. Права по роли проверяют страницы.
export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await refreshSession(request);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isSignedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
