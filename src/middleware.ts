import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/login' || path === '/register' || path.startsWith('/api/auth/')) return NextResponse.next();
  if (!request.cookies.get('soulweb_session')) { const url = request.nextUrl.clone(); url.pathname = '/login'; url.searchParams.set('returnTo', path); return NextResponse.redirect(url); }
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
