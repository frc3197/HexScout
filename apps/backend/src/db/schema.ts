import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm/_relations';

export const roles = sqliteTable('roles', {
  name: text('name').primaryKey(),
});

export const rolePermissions = sqliteTable('role_permissions', {
  roleName: text('role_name')
    .notNull()
    .references(() => roles.name, { onDelete: 'cascade' }),
  permission: text('permission').notNull(), 
}, (table) => [
  primaryKey({ columns: [table.roleName, table.permission] })
]);

export const users = sqliteTable('users', {
  uuid: text('uuid').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  roleName: text('role_name')
    .notNull()
    .references(() => roles.name),
  pinHash: text('pin_hash').notNull(),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  permissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleName], references: [roles.name] }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleName], references: [roles.name] }),
}));
