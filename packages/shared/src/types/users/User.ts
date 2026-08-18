import Role from "./Role.ts";
import { Permission } from "./Permisson.ts";

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

  static fromJSON(json: {
    uuid: string;
    name: string;
    role: { name: string; permissions: Permission[] };
    active?: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    lastLoginAt?: string | Date;
    hours?: number;
  }): User {
    const user = new User(
      json.uuid,
      json.name,
      new Role(json.role.name, json.role.permissions),
    );

    user.active = json.active ?? true;
    user.createdAt = new Date(json.createdAt);
    user.updatedAt = new Date(json.updatedAt);
    user.lastLoginAt = json.lastLoginAt ? new Date(json.lastLoginAt) : undefined;
    user.hours = json.hours ?? 0;
    return user;
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

  static fromJSON(json: {
    uuid: string;
    name: string;
    role: { name: string; permissions: Permission[] };
    pinHash: string;
    active?: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    lastLoginAt?: string | Date;
    hours?: number;
  }): UserRecord {
    const user = new UserRecord(
      json.uuid,
      json.name,
      new Role(json.role.name, json.role.permissions),
      json.pinHash,
    );

    user.active = json.active ?? true;
    user.createdAt = new Date(json.createdAt);
    user.updatedAt = new Date(json.updatedAt);
    user.lastLoginAt = json.lastLoginAt ? new Date(json.lastLoginAt) : undefined;
    user.hours = json.hours ?? 0;
    return user;
  }
}