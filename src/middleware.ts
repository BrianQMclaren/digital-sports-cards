import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/signin", "/signup"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const payload = token ? await verifyJWT(token) : null;
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !payload) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Redirect authenticated users away from signin/signup
  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|next/image|favicon.ico).*)"],
};
