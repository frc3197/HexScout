import { defineRelations, sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  blob,
} from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
  name: text('name').primaryKey(),
})

export const robotPhotos = sqliteTable('robot_photos', {
  uuid: text('uuid')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  teamNumber: integer('team_number').notNull(),

  mimeType: text('mime_type')
    .notNull()
    .default('image/jpeg'),

  data: blob('data', {
    mode: 'buffer',
  }).notNull(),

  createdAt: integer('created_at', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),

  uploaderUuid: text('uploaded_by')
    .notNull()
    .references(() => users.uuid),
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
    .primaryKey().notNull()
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

export const scoutforms = sqliteTable('scout_forms', {
  uuid: text('uuid')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  submittingScouterUuid: text('submitting_scouter_uuid')
    .notNull()
    .references(() => users.uuid),

  eventCode: text('event_code').notNull(),
  matchNumber: integer('match_number').notNull(),
  teamNumber: integer('team_number').notNull(),
  formVersion: text('form_version').notNull(),

  createdAt: integer('created_at', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),

  uploadedAt: integer('uploaded_at', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),

  syncAttempts: integer('sync_attempts').notNull().default(0),
  data: text('data', { mode: 'json' }).notNull(),
})

export const scoutforms_hist = sqliteTable('scout_form_history', {
  scoutFormUuid: text('scout_form_uuid')
    .notNull()
    .references(() => scoutforms.uuid, {
      onDelete: 'cascade',
    }),

  revision: integer('revision').notNull(),
  data: text('data', { mode: 'json' }).notNull(),

  modifiedAt: integer('modified_at', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),

  modifiedBy: text('modified_by')
    .notNull()
    .references(() => users.uuid),
}, (table) => [
  primaryKey({
    columns: [
      table.scoutFormUuid,
      table.revision,
    ],
  }),
])

export const relations = defineRelations(
  {
    roles,
    rolePermissions,
    users,
    scoutforms,
    scoutforms_hist,
    robotPhotos,
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
      submittedScoutForms: r.many.scoutforms({
        from: r.users.uuid,
        to: r.scoutforms.submittingScouterUuid,
      }),
      modifiedScoutFormHistory: r.many.scoutforms_hist({
        from: r.users.uuid,
        to: r.scoutforms_hist.modifiedBy,
      }),
      uploadedRobotPhotos: r.many.robotPhotos({
        from: r.users.uuid,
        to: r.robotPhotos.uploaderUuid,
      }),
    },

    scoutForms: {
      submittingScouter: r.one.users({
        from: r.scoutforms.submittingScouterUuid,
        to: r.users.uuid,
      }),
      history: r.many.scoutforms_hist(),
    },

    scoutFormHistory: {
      scoutForm: r.one.scoutforms({
        from: r.scoutforms_hist.scoutFormUuid,
        to: r.scoutforms.uuid,
      }),
      modifier: r.one.users({
        from: r.scoutforms_hist.modifiedBy,
        to: r.users.uuid,
      }),
    },

    robotPhotos: {
      uploader: r.one.users({
        from: r.robotPhotos.uploaderUuid,
        to: r.users.uuid,
      }),
    },
  }),
)