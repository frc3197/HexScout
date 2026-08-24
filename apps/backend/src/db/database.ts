import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import {
  roles,
  rolePermissions,
  relations,
} from './schema.ts'

import {
  administrator,
  scoutLead,
  stratTeam,
  scouter,
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

export default db