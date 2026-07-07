/**
 * Seeds three dev stakeholders (users + primary wallets + holdings) so the
 * snapshot job has something to seal. Idempotent.
 *
 * Usage: DATABASE_URL=postgres://… pnpm db:seed
 */
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function run() {
  console.log('Seeding development data...')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      INSERT INTO users (external_id) VALUES
      ('u1_ext'),
      ('u2_ext'),
      ('u3_ext')
      ON CONFLICT (external_id) DO NOTHING;
    `)
    const usersRes = await client.query(
      `SELECT id, external_id FROM users WHERE external_id IN ('u1_ext', 'u2_ext', 'u3_ext')`
    )
    const idFor = (externalId: string): string => {
      const row = usersRes.rows.find((u) => u.external_id === externalId)
      if (!row) throw new Error(`Seed user missing: ${externalId}`)
      return row.id
    }
    const u1 = idFor('u1_ext')
    const u2 = idFor('u2_ext')
    const u3 = idFor('u3_ext')
    console.log('Users seeded')

    await client.query(
      `INSERT INTO wallets (user_id, address, is_primary) VALUES
       ($1, '0x51FaF77cd7369B1e2D6DD87965eebaF54C4d782F', true),
       ($2, '0xA169051B20CDF951105a0DA66ADac91a3Bf4f509', true),
       ($3, '0x304f612Cb20ae03875e191dE02126cb3e8377444', true)
       ON CONFLICT (address) DO NOTHING;`,
      [u1, u2, u3]
    )
    console.log('Wallets seeded')

    await client.query(`DELETE FROM holdings WHERE user_id IN ($1, $2, $3)`, [u1, u2, u3])
    await client.query(
      `INSERT INTO holdings (user_id, equity_units) VALUES
       ($1, 5000),
       ($2, 3000),
       ($3, 2000);`,
      [u1, u2, u3]
    )
    console.log('Holdings seeded')

    await client.query('COMMIT')
    console.log('Seed completed successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', error)
    process.exitCode = 1
  } finally {
    client.release()
  }
}

run()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
