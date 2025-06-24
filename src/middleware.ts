import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isPublicPath = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/register';

  // Redirect authenticated users from public paths to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (!isPublicPath && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for authenticated users
  if (token) {
    const userRole = token.role as string;
    const path = request.nextUrl.pathname;

    // Extract the actual path without (dashboard)
    const normalizedPath = path.replace(/\/\(dashboard\)/, '');

    const roleAccess: Record<string, string[]> = {
      '/guards': ['Admin'],
      '/clients': ['Admin'],
      '/audits': ['Admin', 'Client'],
      '/incidents': ['Admin', 'Guard', 'Client'],
      '/alerts': ['Admin', 'Guard', 'Client'],
      '/training': ['Admin', 'Guard']
    };

    // Check if the current path requires specific role access
    for (const [routePath, allowedRoles] of Object.entries(roleAccess)) {
      if (normalizedPath.startsWith(routePath) && !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/(dashboard)/:path*'
  ]
}; 