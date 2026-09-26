import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// ─── Cookie d'auth preview ───
const PREVIEW_COOKIE = 'resa_preview_auth';
const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN ?? 'resa-preview-token-2026';

// Routes toujours accessibles (même non authentifié preview)
const PUBLIC_PATHS = [
  '/preview',
  '/api/preview-auth',
  '/api/webhooks',   // FedaPay + PayPal
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── 0) Autorise les routes publiques ───
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ─── 1) Vérifie le cookie d'auth preview ───
  const cookie = req.cookies.get(PREVIEW_COOKIE)?.value;
  const isAuthed = cookie === PREVIEW_TOKEN;

  if (!isAuthed) {
    const url = new URL('/preview', req.url);
    if (pathname !== '/') url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // ─── 2) Zone admin : auth Supabase + pas d'i18n ───
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options: any }[]
          ) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const url = new URL('/admin/login', req.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    return response;
  }

  // ─── 3) Reste du site : i18n normal ───
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};