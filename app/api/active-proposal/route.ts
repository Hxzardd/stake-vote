import { NextResponse } from 'next/server'
import { Pool } from 'pg'

let _pool: Pool | null = null
function getPool() {
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return _pool
}

export async function GET() {
  try {
    const pool = getPool()
    // Fetch the most recently created proposal that has a deployed contract
    const res = await pool.query(`
      SELECT id, title, description, contract_address, status, quorum_bps, created_at
      FROM proposals 
      WHERE contract_address IS NOT NULL 
      ORDER BY created_at DESC 
      LIMIT 1
    `)

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'No active proposal found' }, { status: 404 })
    }

    return NextResponse.json(res.rows[0])
  } catch (error) {
    console.error('Error fetching active proposal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
