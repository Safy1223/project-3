import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("Middleware triggered on path:", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
