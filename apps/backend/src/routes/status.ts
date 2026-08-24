import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import db from '../db/database.ts'

const statusRoutes = new Hono()

statusRoutes.get('/', async (c) => {
  try {
    await db.run(sql`SELECT 1`)

    return c.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      services: {
        api: 'UP',
        database: 'UP',
      },
    }, 200)
  } catch (error) {
    console.error('Database health check failed:', error)

    return c.json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      services: {
        api: 'UP',
        database: 'DOWN',
      },
    }, 503)
  }
})

export default statusRoutes