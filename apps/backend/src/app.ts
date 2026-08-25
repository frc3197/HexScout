import { Hono } from 'hono'
import authRoutes from './routes/auth.ts'
import dbRoutes from './routes/db.ts'
import imageRoutes from './routes/image.ts'
import scoutRoutes from './routes/scout.ts'
import statusRoutes from './routes/status.ts'
import userRoutes from './routes/users.ts'
import type { AppVariables } from './types/hono.ts'

const app = new Hono<{
  Variables: AppVariables
}>()

app.get('/api', (context) => {
  return context.text('Hello Backend!')
})

app.route('/api/auth', authRoutes)
app.route('/api/db', dbRoutes)
app.route('/api/image', imageRoutes)
app.route('/api/scout', scoutRoutes)
app.route('/api/status', statusRoutes)
app.route('/api/users', userRoutes)


console.log(app.routes)

export default app