import { User, UserRecord } from "../types/users/User.ts";
import Role from "../types/users/Role.ts";
import { Permission } from "../types/users/Permisson.ts";

function toPermission(value: string): Permission {
  if (!Object.values(Permission).includes(value as Permission)) {
    throw new Error(`Invalid permission: ${value}`);
  }

  return value as Permission;
}

export function toUserRecord(user: {
  uuid: string;
  name: string;
  roleName: string;
  pinHash: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  hours: number;
  role: {
    name: string;
    permissions: {
      roleName: string;
      permission: string;
    }[];
  } | null;
}): UserRecord {
  if (!user.role) {
    throw new Error(`User ${user.uuid} has no valid role`);
  }

  const role = new Role(
    user.role.name,
    user.role.permissions.map((p) => toPermission(p.permission))
  );

  const record = new UserRecord(
    user.uuid,
    user.name,
    role,
    user.pinHash
  );

  record.active = user.active;
  record.createdAt = user.createdAt;
  record.updatedAt = user.updatedAt;
  record.lastLoginAt = user.lastLoginAt ?? undefined;
  record.hours = user.hours;

  return record;
}

export function toUser(record: UserRecord): User {
  const user = new User(
    record.uuid,
    record.name,
    record.role
  );

  user.active = record.active;
  user.createdAt = record.createdAt;
  user.updatedAt = record.updatedAt;
  user.lastLoginAt = record.lastLoginAt;
  user.hours = record.hours;

  return user;
}