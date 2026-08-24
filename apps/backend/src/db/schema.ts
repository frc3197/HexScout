import { defineRelations, sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  name: text('name').primaryKey(),
})

export const rolePermissions = sqliteTable('role_permissions', {
  roleName: text('role_name')
    .notNull()
    .references(() => roles.name, {
      onDelete: 'cascade',
    }),

  permission: text('permission').notNull(),
}, (table) => [
  primaryKey({
    columns: [
      table.roleName,
      table.permission,
    ],
  }),
])

export const users = sqliteTable('users', {
  uuid: text('uuid')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text('name').notNull(),

  roleName: text('role_name')
    .notNull()
    .references(() => roles.name),

  pinHash: text('pin_hash').notNull(),

  active: integer('active', {
    mode: 'boolean',
  })
    .notNull()
    .default(true),

  createdAt: integer('created_at', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: integer('updated_at', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),

  lastLoginAt: integer('last_login_at', {
    mode: 'timestamp',
  }),

  hours: integer('hours').notNull().default(0)
})

export const relations = defineRelations(
  {
    roles,
    rolePermissions,
    users,
  },
  (r) => ({
    roles: {
      users: r.many.users(),
      permissions: r.many.rolePermissions(),
    },

    rolePermissions: {
      role: r.one.roles({
        from: r.rolePermissions.roleName,
        to: r.roles.name,
      }),
    },

    users: {
      role: r.one.roles({
        from: r.users.roleName,
        to: r.roles.name,
      }),
    },
  }),
)