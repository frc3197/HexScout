import { Hono } from 'hono'
import authRoutes from './routes/auth.ts'
import dbRoutes from './routes/db.ts'
import imageRoutes from './routes/image.ts'
import scoutRoutes from './routes/scout.ts'
import statusRoutes from './routes/status.ts'
import userRoutes from './routes/users.ts'

const app = new Hono()

app.get('/', (context) => {
  return context.text('Hello Backend!')
})

app.route('/auth', authRoutes)
app.route('/db', dbRoutes)
app.route('/image', imageRoutes)
app.route('/scout', scoutRoutes)
app.route('/status', statusRoutes)
app.route('/users', userRoutes)

export default app