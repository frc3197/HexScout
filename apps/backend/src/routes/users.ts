import { Hono } from 'hono'
import type { AppVariables } from '../types/hono.ts'
import { createHash, Permission, toUser, toUserRecord } from '@HexScout/shared'
import db from '../db/database.ts'
import { requirePermission, requireSession } from './middleware.ts'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema.ts'

const userRoutes = new Hono<{
  Variables: AppVariables
}>()

userRoutes.get('/me', requireSession, async (c) => {
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

async function findUser(uuid: string) {
  return db.query.users.findFirst({
    where: { uuid },
    with: {
      role: {
        with: {
          permissions: true,
        },
      },
    },
  })
}

function publicUser(user: NonNullable<Awaited<ReturnType<typeof findUser>>>) {
  return toUser(toUserRecord(user))
}

userRoutes.get('/', requireSession, requirePermission(Permission.UsersEdit), async (c) => {
  const userRows = await db.query.users.findMany({
    with: {
      role: {
        with: {
          permissions: true,
        },
      },
    },
  })

  return c.json({ users: userRows.map(publicUser) })
})

userRoutes.post('/', requireSession, requirePermission(Permission.UsersAdd), async (c) => {
  const body = await c.req.json<{
    name?: string
    pin?: string
    roleName?: string
  }>()

  if (!body.name || !body.pin) {
    return c.json({ error: 'Name and PIN are required' }, 400)
  }

  const roleName = body.roleName ?? 'Scouter'
  const role = await db.query.roles.findFirst({ where: { name: roleName } })
  if (!role) {
    return c.json({ error: 'Invalid role' }, 400)
  }

  const existingUser = await db.query.users.findFirst({ where: { name: body.name } })
  if (existingUser) {
    return c.json({ error: 'A user with that name already exists' }, 409)
  }

  const [createdUser] = await db.insert(users).values({
    name: body.name,
    roleName,
    pinHash: await createHash(body.pin),
  }).returning({ uuid: users.uuid })

  const user = await findUser(createdUser.uuid)
  return c.json({ user: publicUser(user!) }, 201)
})

userRoutes.patch('/:uuid', requireSession, requirePermission(Permission.UsersEdit), async (c) => {
  const uuid = c.req.param('uuid')
  const body = await c.req.json<{
    name?: string
    pin?: string
    roleName?: string
    active?: boolean
  }>()
  const existingUser = await findUser(uuid)

  if (!existingUser) {
    return c.json({ error: 'User not found' }, 404)
  }

  if (body.roleName) {
    const role = await db.query.roles.findFirst({ where: { name: body.roleName } })
    if (!role) {
      return c.json({ error: 'Invalid role' }, 400)
    }
  }

  if (body.name && body.name !== existingUser.name) {
    const nameConflict = await db.query.users.findFirst({ where: { name: body.name } })
    if (nameConflict) {
      return c.json({ error: 'A user with that name already exists' }, 409)
    }
  }

  const update: {
    name?: string
    pinHash?: string
    roleName?: string
    active?: boolean
    updatedAt: Date
  } = {
    updatedAt: new Date(),
  }

  if (body.name !== undefined) update.name = body.name
  if (body.roleName !== undefined) update.roleName = body.roleName
  if (body.active !== undefined) update.active = body.active
  if (body.pin !== undefined) update.pinHash = await createHash(body.pin)

  await db.update(users).set(update).where(eq(users.uuid, uuid))
  const updatedUser = await findUser(uuid)
  return c.json({ user: publicUser(updatedUser!) })
})

userRoutes.delete('/:uuid', requireSession, requirePermission(Permission.UsersDelete), async (c) => {
  const uuid = c.req.param('uuid')
  const session = c.get('session')

  if (session.userId === uuid) {
    return c.json({ error: 'You cannot delete your own account' }, 400)
  }

  const deleted = await db.delete(users)
    .where(eq(users.uuid, uuid))
    .returning({ uuid: users.uuid })

  if (deleted.length === 0) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ success: true })
})

export default userRoutes