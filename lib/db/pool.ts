import 'server-only'
import { Pool, type PoolClient } from 'pg'
import { getDatabaseUrl } from '@/lib/config/server'

let _pool: Pool | null = null

/** The single pg Pool for the whole app (API routes + server actions). */
export function getPool(): Pool {
  _pool ??= new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
    idleTimeoutMillis: 30_000,
  })
  return _pool
}

export type { PoolClient }

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  return withClient(async (client) => {
    await client.query('BEGIN')
    try {
      const result = await fn(client)
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  })
}
