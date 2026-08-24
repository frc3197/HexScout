import { Hono } from 'hono'
import {
  deleteCookie,
  getCookie,
  setCookie,
} from 'hono/cookie'
import { eq } from 'drizzle-orm'

import { requireSession } from './middleware.ts'
import sessionService from '../security/SessionService.ts'

import type { AppVariables } from '../types/hono.ts'

import {
  checkHash,
  toUser,
  toUserRecord,
} from '@HexScout/shared'

import db from '../db/database.ts'
import { users } from '../db/schema.ts'

const authRoutes = new Hono<{
  Variables: AppVariables
}>()

authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{
    name?: string
    pin?: string
  }>()

  if (!body.name || !body.pin) {
    return c.json({
      error: 'Name and PIN are required',
    }, 400)
  }

  const user = await db.query.users.findFirst({
    where: {
      name: body.name,
    },
    with: {
      role: {
        with: {
          permissions: true,
        },
      },
    },
  })

  if (!user || !user.active) {
    return c.json({
      error: 'Invalid credentials',
    }, 401)
  }

  if (!user.role) {
    return c.json({
      error: 'User has no valid role',
    }, 500)
  }

  const validPin = await checkHash(
    body.pin,
    user.pinHash,
  )

  if (!validPin) {
    return c.json({
      error: 'Invalid credentials',
    }, 401)
  }

  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.uuid, user.uuid))

  const token = sessionService.create(user.uuid)

  setCookie(c, 'session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return c.json({
    user: toUser(toUserRecord(user)),
  })
})

authRoutes.get('/me', requireSession, async (c) => {
  const session = c.get('session')

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
    return c.json({
      error: 'User not found',
    }, 404)
  }

  if (!user.active) {
    return c.json({
      error: 'User account is inactive',
    }, 403)
  }

  if (!user.role) {
    return c.json({
      error: 'User has no valid role',
    }, 500)
  }

  return c.json({
    user: toUser(toUserRecord(user)),
  })
})

authRoutes.post('/logout', (c) => {
  const token = getCookie(c, 'session')

  if (token) {
    sessionService.destroy(token)
  }

  deleteCookie(c, 'session', {
    path: '/',
  })

  return c.json({
    success: true,
  })
})

export default authRoutes