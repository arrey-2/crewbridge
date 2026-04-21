import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/translate', '/logs', '/about', '/account', '/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedRoutes.some((route) => pathname.startsWith(route))) return NextResponse.next();

  const token = request.cookies.get('cb-access-token')?.value;
  const demo = request.cookies.get('cb-demo')?.value === '1';
  if (!token && !demo) {
    return NextResponse.redirect(new URL('/login?message=Please+log+in+to+continue', request.url));
  }

  const lastActive = Number(request.cookies.get('cb-last-active')?.value ?? '0');
  if (!demo && lastActive && Date.now() - lastActive > 30 * 60 * 1000) {
    const res = NextResponse.redirect(new URL('/login?message=Session+expired.+Please+log+in+again', request.url));
    res.cookies.delete('cb-access-token');
    res.cookies.delete('cb-last-active');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/translate/:path*', '/logs/:path*', '/about/:path*', '/account/:path*', '/onboarding/:path*']
};
