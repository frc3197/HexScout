import { Permission, Permissions } from "./Permission";

export class Role {
  constructor(
    public readonly name: string,
    public readonly permissions: readonly Permission[],
  ) {}
}

export const Scouter = new Role("Scouter", [
  Permissions.viewCompetition,
  Permissions.viewForms,
  Permissions.viewPrivateNotebook,
  Permissions.viewPublicNotebook,
  Permissions.viewSchedule,
  Permissions.viewTeams,
  Permissions.viewUsers,

  Permissions.uploadForm,
  Permissions.uploadImage,
  Permissions.uploadPrivateNotebook,
  Permissions.deletePrivateNotebook,
]);

export const StrategyTeam = new Role("StrategyTeam", [
  ...Scouter.permissions,
  Permissions.adminUI,
  Permissions.resyncTBA,
  Permissions.uploadPublicNotebook,
]);

export const PitMember = new Role("PitMember", [
  ...StrategyTeam.permissions,
  Permissions.deletePublicNotebook,
  Permissions.changeCompetition,
  Permissions.editForm,
  Permissions.manageScouterRotation,
  Permissions.manageScouters,
]);

export const StrategyLead = new Role("StrategyLead", [
  ...PitMember.permissions,
  Permissions.deleteForm,
  Permissions.createUser,
  Permissions.editUser,
  Permissions.resetUser,
  Permissions.editImage,
  Permissions.deleteImage,
]);

export const Admin = new Role("Admin", [
  ...StrategyLead.permissions,
  ...Object.values(Permissions),
]);

export const Mentor = new Role("Mentor", [...Admin.permissions]);
