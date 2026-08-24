import { Permission } from "./Permisson.ts";

export default class Role {
  name: string;
  permissions: Permission[];

  constructor(name: string, permissions: Permission[]) {
    this.name = name;
    this.permissions = permissions;
  }
}

export const administrator = new Role(
  "Administrator",
  [
    Permission.ScoutingUpload,
    Permission.ScoutingDelete,
    Permission.ScoutingEditSubmitted,
    Permission.ScoutingExport,
    Permission.ScoutingClearDB,

    Permission.UsersAdd,
    Permission.UsersDelete,
    Permission.UsersEdit,
    Permission.UsersClearDB,

    Permission.ImagesUpload,
    Permission.ImagesDelete,
    Permission.ImagesReplace,
    Permission.ImagesClearDB,

    Permission.AdminAccess,
    Permission.DBAdminAccess,
  ]
);

export const scoutLead = new Role(
  "ScoutLead",
  [
    Permission.ScoutingUpload,
    Permission.ScoutingDelete,
    Permission.ScoutingEditSubmitted,
    Permission.ScoutingExport,

    Permission.UsersEdit,

    Permission.ImagesUpload,
    Permission.ImagesDelete,
    Permission.ImagesReplace,

    Permission.AdminAccess,
  ]
);

export const stratTeam = new Role(
  "StratTeam",
  [
    Permission.ScoutingUpload,
    Permission.ScoutingDelete,
    Permission.ScoutingEditSubmitted,
    Permission.ScoutingExport,

    Permission.UsersAdd,
    Permission.UsersEdit,

    Permission.ImagesUpload,
    Permission.ImagesDelete,
    Permission.ImagesReplace,
  ]
);

export const scouter = new Role(
  "Scouter",
  [
    Permission.ScoutingUpload,
    Permission.ImagesUpload,
  ]
);