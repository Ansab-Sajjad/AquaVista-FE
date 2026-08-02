import { NextResponse } from "next/server";

export function middleware() {
  // Authentication is managed client-side via localStorage and storage events.
  // Protected pages are guarded by useAuthGuard in the dashboard layout.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|videos|.*.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)).*)",
  ],
};
