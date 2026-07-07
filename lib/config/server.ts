import 'server-only'
import { z } from 'zod'

/**
 * Server-side environment access. Validation is lazy (first use, not module
 * load) so `next build` succeeds without production secrets present.
 */

const databaseSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required (Postgres connection string)'),
})

const chainSchema = z.object({
  RPC_URL: z
    .string()
    .url('RPC_URL must be a valid URL (Polygon Amoy JSON-RPC endpoint)'),
  ADMIN_PRIVATE_KEY: z
    .string()
    .regex(
      /^(0x)?[0-9a-fA-F]{64}$/,
      'ADMIN_PRIVATE_KEY must be a 32-byte hex private key'
    ),
})

const authSchema = z.object({
  ADMIN_PASSWORD: z
    .string()
    .min(8, 'ADMIN_PASSWORD is required (min 8 characters)'),
})

function parse<T extends z.ZodTypeAny>(schema: T, label: string): z.infer<T> {
  const result = schema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues.map((i) => i.message).join('; ')
    throw new Error(`Invalid ${label} configuration: ${issues}`)
  }
  return result.data
}

let databaseUrl: string | undefined
export function getDatabaseUrl(): string {
  databaseUrl ??= parse(databaseSchema, 'database').DATABASE_URL
  return databaseUrl
}

let chainConfig: { rpcUrl: string; adminPrivateKey: string } | undefined
export function getChainConfig(): { rpcUrl: string; adminPrivateKey: string } {
  if (!chainConfig) {
    const env = parse(chainSchema, 'chain')
    chainConfig = { rpcUrl: env.RPC_URL, adminPrivateKey: env.ADMIN_PRIVATE_KEY }
  }
  return chainConfig
}

let adminPassword: string | undefined
export function getAdminPassword(): string {
  adminPassword ??= parse(authSchema, 'admin auth').ADMIN_PASSWORD
  return adminPassword
}
