import { Hono } from 'hono'

const app = new Hono()

app.get('/', (context) => {
  return context.text('Hello Backend!')
})

export default app