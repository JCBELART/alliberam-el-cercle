import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function unauthorized(): NextResponse {
  return new NextResponse('Accés restringit.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="El Cercle Admin", charset="UTF-8"',
    },
  });
}

function securityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(), geolocation=(), payment=(self)'
  );
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (isAdmin) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
      return new NextResponse(
        'El panell d’administració no està configurat. Defineix ADMIN_PASSWORD.',
        { status: 503 }
      );
    }

    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Basic ')) return unauthorized();

    let user = '';
    let suppliedPassword = '';
    try {
      const decoded = atob(authorization.slice(6));
      const separator = decoded.indexOf(':');
      user = separator >= 0 ? decoded.slice(0, separator) : decoded;
      suppliedPassword = separator >= 0 ? decoded.slice(separator + 1) : '';
    } catch {
      return unauthorized();
    }

    const expectedUser = process.env.ADMIN_USER || 'admin';
    if (user !== expectedUser || suppliedPassword !== password) return unauthorized();
  }

  return securityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
