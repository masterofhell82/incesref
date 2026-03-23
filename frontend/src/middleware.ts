import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { verifyTokenUser } from './Services/Authentications';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const auth = req.cookies.get('session')?.value ?? '';
    const isValid = await verifyTokenUser(auth);

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
