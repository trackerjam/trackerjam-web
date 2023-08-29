import {encode, getToken} from 'next-auth/jwt';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// https://github.com/nextauthjs/next-auth/issues/8254#issuecomment-1694688950
const sessionCookie = process.env.NEXTAUTH_URL?.startsWith('https://')
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

function signOut(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/api/auth/signin', request.url));

  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes('next-auth')) response.cookies.delete(cookie.name);
  });

  return response;
}

function shouldUpdateToken(token: string) {
  // Check the token expiration date or whatever logic you need
  if (token) {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  console.log('Executed middleware');

  const session: any = await getToken({req: request});

  if (!session) return signOut(request);

  const response = NextResponse.next();

  if (shouldUpdateToken(session.accessToken)) {
    // Here yoy retrieve the new access token from your custom backend
    const newAccessToken = 'Session updated server side!!';

    const newSessionToken = await encode({
      secret: process.env.NEXTAUTH_SECRET as string,
      token: {
        ...session,
        accessToken: newAccessToken,
      },
      maxAge: 30 * 24 * 60 * 60, // 30 days, or get the previous token's exp
    });

    // Update session token with new access token
    response.cookies.set(sessionCookie, newSessionToken);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard', '/events', '/settings', '/team/:path*', '/statistics/:path*'],
};
