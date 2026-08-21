export enum Permission {
  ScoutingUpload        = "scouting.upload",
  ScoutingDelete        = "scouting.delete",
  ScoutingEditSubmitted = "scouting.editSubmitted",
  ScoutingExport        = "scouting.export",
  ScoutingClearDB       = "scouting.clearDB",

  UsersAdd     = "users.add",
  UsersDelete  = "users.delete",
  UsersEdit    = "users.edit",
  UsersClearDB = "users.clearDB",

  ImagesUpload  = "images.upload",
  ImagesDelete  = "images.delete",
  ImagesReplace = "images.replace",
  ImagesClearDB = "images.clearDB",

  AdminAccess = "admin.access",
  DBAdminAccess = "database-adminpanel.access"
}