import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// ─── Basic Auth (protection preview) ───
const PREVIEW_USER = process.env.PREVIEW_USER ?? 'resa';
const PREVIEW_PASS = process.env.PREVIEW_PASS ?? 'resa-preview-2026';

function hasValidBasicAuth(req: NextRequest): boolean {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return false;

  try {
    const decoded = atob(header.slice(6));
    const idx = decoded.indexOf(':');
    if (idx < 0) return false;
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    return user === PREVIEW_USER && pass === PREVIEW_PASS;
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── 0) Blocage global de la preview ───
  if (!hasValidBasicAuth(req)) {
    return new NextResponse(
      'Accès restreint — Environnement de prévisualisation privé.\n\n' +
      'Ce site est actuellement en pause.\n' +
      'Contact : contact@cataria-systems.com',
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="RESA Preview", charset="UTF-8"',
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }

  // ─── Zone admin : auth Supabase + pas d'i18n ───
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

  // ─── Reste du site : i18n normal ───
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};