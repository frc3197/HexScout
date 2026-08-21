import { Permission } from "./Permisson.ts"

export default class Role {
  name: string;
  permissions: Permission[];

  constructor(name: string, permissions?: Permission[]) {
    this.name = name;
    this.permissions = permissions ? permissions : [Permission.ScoutingUpload, Permission.ImagesUpload]
  }
}

export const administrator = new Role(
  "Admin",
  Object.values(Permission)
)

export const scoutLead = new Role(
  "ScouterLead",
  Object.values(Permission).filter(
    permission => permission !== Permission.DBAdminAccess
  )
)

export const stratTeam = new Role(
  "StrategyTeam",
  Object.values(Permission).filter(
    permission => ![
      Permission.AdminAccess,
      Permission.DBAdminAccess,
      Permission.ImagesClearDB,
      Permission.ScoutingClearDB,
      Permission.UsersDelete,
      Permission.UsersClearDB
    ].includes(permission)
  )
)

export const scouter = new Role(
  "Scouter",
  [
    Permission.ImagesUpload,
    Permission.ScoutingUpload
  ]
)