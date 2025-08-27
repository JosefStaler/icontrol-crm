import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/app')) {
    const accessToken = req.cookies.get('accessToken');
    const refreshToken = req.cookies.get('refreshToken');
    
    if (!accessToken && !refreshToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    // Se não tem access token mas tem refresh token, deixa passar
    // O cliente tentará fazer refresh automaticamente
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};






