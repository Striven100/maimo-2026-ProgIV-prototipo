import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAuth = req.nextUrl.pathname.startsWith("/login") || 
                   req.nextUrl.pathname.startsWith("/register");
  const isOnApi = req.nextUrl.pathname.startsWith("/api");

  if (isOnApi && !isLoggedIn) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!isLoggedIn && !isOnAuth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isOnAuth) {
    const dashboardUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
