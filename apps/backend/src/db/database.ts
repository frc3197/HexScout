import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import {
  roles,
  rolePermissions,
  relations,
  users,
} from './schema.ts'

import {
  administrator,
  scoutLead,
  stratTeam,
  scouter,
  createHash,
} from '@HexScout/shared'

const sqlite = new Database('database.sqlite')

const db = drizzle({
  client: sqlite,
  relations,
})

const defaultRoles = [
  administrator,
  scoutLead,
  stratTeam,
  scouter,
]

for (const role of defaultRoles) {
  await db
    .insert(roles)
    .values({
      name: role.name,
    })
    .onConflictDoNothing()

  const permissionsPayload = role.permissions.map((permission) => ({
    roleName: role.name,
    permission,
  }))

  if (permissionsPayload.length > 0) {
    await db
      .insert(rolePermissions)
      .values(permissionsPayload)
      .onConflictDoNothing()
  }
}

const adminName = process.env.ADMIN_NAME ?? 'admin'
const adminPin = process.env.ADMIN_PIN

if (adminPin) {
  const existingAdmin = await db.query.users.findFirst({
    where: {
      name: adminName,
    },
  })

  if (!existingAdmin) {
    await db.insert(users).values({
      name: adminName,
      roleName: administrator.name,
      pinHash: await createHash(adminPin),
    })
  }
} else {
  console.warn('ADMIN_PIN is not set; skipping admin user seed.')
}

export default db