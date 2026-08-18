import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'

import sessionService from '../security/SessionService.ts'
import db from '../db/database.ts'

import type { Permission } from '@HexScout/shared'

export const requireSession = createMiddleware(async (c, next) => {
  const token = getCookie(c, 'session')

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const session = sessionService.get(token)

  if (!session) {
    return c.json({ error: 'Invalid or expired session' }, 401)
  }

  c.set('session', session)

  await next()
})

export const requirePermission = (permission: Permission) =>
  createMiddleware(async (c, next) => {
    const session = c.get('session')

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const user = await db.query.users.findFirst({
      where: {
        uuid: session.userId,
      },
      with: {
        role: {
          with: {
            permissions: true,
          },
        },
      },
    })

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    if (!user.active) {
      return c.json({ error: 'Account is inactive' }, 403)
    }

    if (!user.role) {
      return c.json({ error: 'User has no valid role' }, 500)
    }

    const hasPermission = user.role.permissions.some(
      (p) => p.permission === permission
    )

    if (!hasPermission) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })