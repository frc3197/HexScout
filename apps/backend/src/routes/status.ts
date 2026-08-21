// /api/status

import app from "../app.ts";

app.get('/api', (context) => {
  return context.text('Hello Backend!')
})