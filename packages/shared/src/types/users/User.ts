import Role from "./Role.ts";

export default class User {
  uuid: string;
  name: string;
  role: Role;
  pinHash: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;

  constructor(
    uuid: string,
    name: string,
    role: Role,
    pinHash: string
  ) {
    this.uuid = uuid;
    this.name = name;
    this.role = role;
    this.pinHash = pinHash;
    this.active = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}