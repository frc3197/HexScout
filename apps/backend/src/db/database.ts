import { drizzle } from 'drizzle-orm/node-sqlite';

const db = drizzle("database.sqlite");

import { roles, rolePermissions } from './schema.ts';
import { administrator, scoutLead, stratTeam, scouter } from "@HexScout/shared"
import { existsSync } from 'node:fs';

const defaultRoles = [
  administrator,
  scoutLead,
  stratTeam,
  scouter,
];

for (const role of defaultRoles) {
  await db
    .insert(roles)
    .values({ name: role.name })
    .onConflictDoNothing();

  const permissionsPayload = role.permissions.map((permission) => ({
    roleName: role.name,
    permission,
  }));

  if (permissionsPayload.length > 0) {
    await db
      .insert(rolePermissions)
      .values(permissionsPayload)
      .onConflictDoNothing();
  }
}