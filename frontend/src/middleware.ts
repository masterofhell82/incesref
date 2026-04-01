import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const verifyTokenInMiddleware = async (token: string) => {
  if (!token) return false;

  try {
    const url = `${process.env.NEXT_PUBLIC_URL_API_BACKEND}/api/verifytoken`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ token }),
      cache: 'no-store',
    });

    return response.ok;
  } catch (error) {
    console.error('Error in middleware token verification:', error);
    return false;
  }
};

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const auth = req.cookies.get('session')?.value ?? '';
    const isValid = await verifyTokenInMiddleware(auth);

    // Si el usuario accede a /signin
    if (req.nextUrl.pathname === '/signin') {
      // Si está autenticado, redirigir a /admin
      if (auth && isValid) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      // Si no está autenticado, permitir acceso a /signin
      return res;
    }

    // Para las demás rutas protegidas
    if (!auth || !isValid) {
      return NextResponse.redirect(new URL('/signin', req.url));
    }
    return res;
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/signin', req.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/signin',
    '/admin:path*',
    '/admin/certificados:path*',
    '/admin/certificados/formatos:path*',
    '/admin/certificados/cargamasiva:path*',
    '/centers/cores:path*',
  ],
};
