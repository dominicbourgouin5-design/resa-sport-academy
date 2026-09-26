import { NextRequest, NextResponse } from 'next/server';

const PREVIEW_COOKIE = 'resa_preview_auth';
const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN ?? 'resa-preview-token-2026';
const PREVIEW_PASSWORD = process.env.PREVIEW_PASSWORD ?? 'resa-preview-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body ?? {};

    if (!password || password !== PREVIEW_PASSWORD) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    // Cookie valable 30 jours
    res.cookies.set(PREVIEW_COOKIE, PREVIEW_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return res;
  } catch {
    return NextResponse.json(
      { error: 'Requête invalide.' },
      { status: 400 }
    );
  }
}