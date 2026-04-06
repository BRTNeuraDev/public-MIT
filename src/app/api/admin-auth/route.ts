import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/** Session cookie name for admin access */
const COOKIE_NAME = "kit_admin_session";

/** Session duration: 1 hour */
const SESSION_MAX_AGE = 60 * 60;

/**
 * POST /api/admin-auth — validates the admin PIN and sets an HTTP-only session cookie.
 * The PIN is compared server-side and never exposed to the client bundle.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const pin = typeof body.pin === "string" ? body.pin.trim() : "";

    const adminPin = process.env.ADMIN_PIN;
    if (!adminPin) {
      return NextResponse.json(
        { error: "Admin access not configured" },
        { status: 503 }
      );
    }

    if (!pin || pin !== adminPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    // Set HTTP-only cookie — not accessible via JavaScript
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_MAX_AGE,
      path: "/admin",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/**
 * GET /api/admin-auth — checks if the current session is authenticated.
 */
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value === "authenticated") {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

/**
 * DELETE /api/admin-auth — logs out by clearing the session cookie.
 */
export async function DELETE(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/admin",
  });
  return response;
}
