import Role from "./Role.ts";

export class User {
  uuid: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  hours: number;

  constructor(
    uuid: string,
    name: string,
    role: Role
  ) {
    this.uuid = uuid;
    this.name = name;
    this.role = role;
    this.active = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.hours = 0;
  }
}

export class UserRecord extends User {
  pinHash: string;

  constructor(
    uuid: string,
    name: string,
    role: Role,
    pinHash: string
  ) {
    super(uuid, name, role);
    this.pinHash = pinHash;
  }
}