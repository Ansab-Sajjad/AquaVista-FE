import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/password-reset",
  "/auth/password-new",
  "/auth/activate",
  "/auth/terms-and-conditions",
  "/auth/privacy-policy",
  "/auth/get-verification",
  "/auth/set-verification",
  "/auth/password-sent",
];

function isPublicPath(pathname: string) {
  if (pathname === "/") {
    return true;
  }

  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("aquavista-auth-token")?.value;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|videos|.*.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
  ],
};
