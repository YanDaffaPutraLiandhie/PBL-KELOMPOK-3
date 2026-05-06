import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = []
) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const pathname = req.nextUrl.pathname;

    // Pastikan setiap route di requireAuth memiliki prefix '/'
    const requireAuthRoutes = requireAuth.map(route => 
      route.startsWith('/') ? route : `/${route}`
    );

    // Cek apakah halaman yang diakses ada di daftar halaman yang diproteksi
    const isProtected = requireAuthRoutes.some(route => pathname.startsWith(route));

    if (isProtected) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      // Jika tidak ada token (belum login), lempar ke halaman login
      if (!token) {
        const url = new URL("/auth/login", req.url);
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
      }
    }
    return middleware(req, event);
  };
}