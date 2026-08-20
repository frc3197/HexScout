import { serve } from "@hono/node-server"
import app from "./app.ts"

const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Hono server is running on http://localhost:${info.port}`)
})

process.on('SIGINT', () => {
  server.close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})