export class Permission {
  constructor(
    public readonly id: string,
    public readonly desc: string,
  ) {}
}

export const Permissions = {
  viewForms: new Permission("form:view", "View Forms"),
  uploadForm: new Permission("form:upload", "Upload Form"),
  editForm: new Permission("form:edit", "Edit Any Form"),
  deleteForm: new Permission("form:delete", "Delete Form"),

  viewPrivateNotebook: new Permission(
    "notebook:private:view",
    "View owns Private Notebooks",
  ),
  uploadPrivateNotebook: new Permission(
    "notebook:private:upload",
    "Upload a Private Notebook",
  ),
  deletePrivateNotebook: new Permission(
    "notebook:private:delete",
    "Delete a Private Notebook",
  ),

  viewPublicNotebook: new Permission(
    "notebook:public:view",
    "View Public Notebooks",
  ),
  uploadPublicNotebook: new Permission(
    "notebook:public:upload",
    "Upload a Public Notebook",
  ),
  deletePublicNotebook: new Permission(
    "notebook:public:delete",
    "Delete a Public Notebook",
  ),

  viewUsers: new Permission("users:view", "View Users"),
  createUser: new Permission("users:create", "Create a User"),
  editUser: new Permission("users:edit", "Edit Any User Data"),
  deleteUser: new Permission("users:delete", "Delete a User"),
  resetUser: new Permission(
    "users:reset",
    "Reset a User's Password that is not their owns",
  ),

  manageScouters: new Permission("scouter:manage", "Manage Scouters"),
  manageScouterRotation: new Permission(
    "scouter:rotation",
    "Manage Scouter Rotation",
  ),

  viewCompetition: new Permission("comp:view", "View Competition"),
  changeCompetition: new Permission(
    "comp:change",
    "Change Current Competition",
  ),

  viewTeams: new Permission("comp:teams:view", "View Teams"),
  viewSchedule: new Permission("comp:schedule:view", "View Match Schedule"),

  uploadImage: new Permission("images:upload", "Upload Team Images"),
  editImage: new Permission("images:edit", "Replace Team Images"),
  deleteImage: new Permission("images:delete", "Delete Team Images"),

  clearTable: new Permission("admin:clearTable", "Clear a Form Table"),
  adminUI: new Permission("admin:adminUI", "Access Admin UI"),
  resyncTBA: new Permission("admin:resyncTBA", "Resync TBA"),
} as const;
