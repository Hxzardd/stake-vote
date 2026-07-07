import 'server-only'
import { timingSafeEqual } from 'node:crypto'
import { headers } from 'next/headers'
import { getAdminPassword } from '@/lib/config/server'

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized: admin credentials required')
    this.name = 'UnauthorizedError'
  }
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    // Compare against self to keep timing independent of the mismatch point.
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

/**
 * Asserts the current request carries valid admin Basic Auth credentials.
 *
 * The middleware gate only covers /admin page routes; server actions are
 * addressable by action ID from any route, so every admin action must call
 * this before touching the database or the chain.
 */
export async function requireAdmin(): Promise<void> {
  const headerList = await headers()
  const authorization = headerList.get('authorization')
  if (!authorization?.startsWith('Basic ')) throw new UnauthorizedError()

  let user = ''
  let password = ''
  try {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf-8')
    const separator = decoded.indexOf(':')
    user = decoded.slice(0, separator)
    password = decoded.slice(separator + 1)
  } catch {
    throw new UnauthorizedError()
  }

  const userOk = safeEqual(user, 'admin')
  const passwordOk = safeEqual(password, getAdminPassword())
  if (!userOk || !passwordOk) throw new UnauthorizedError()
}
