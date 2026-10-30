import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    'shaktiq-nextauth-super-secret-production-and-development-key-32-chars-long!';

  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/runs') ||
    pathname.startsWith('/tokens') ||
    isAdminPage;

  // If already authenticated and trying to access login/register -> redirect to dashboard/admin to prevent multiple logins
  if (isAuthPage && token && !token.disabled) {
    if (token.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/overview', req.url));
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If accessing protected routes
  if (isProtectedPage) {
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If account was suspended/disabled
    if (token.disabled) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'AccountSuspended');
      return NextResponse.redirect(loginUrl);
    }

    // Role check: Only admin can access /admin routes
    if (isAdminPage && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=AdminRequired', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/projects/:path*',
    '/runs/:path*',
    '/tokens/:path*',
    '/admin/:path*',
  ],
};
