import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * First gate for the admin panel. Server actions perform their own auth
 * check (lib/auth.ts requireAdmin) since they are addressable outside the
 * /admin matcher.
 */
export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1] ?? ''
    const [user, pwd] = atob(authValue).split(':')

    if (user === 'admin' && process.env.ADMIN_PASSWORD && pwd === process.env.ADMIN_PASSWORD) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Auth Required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
