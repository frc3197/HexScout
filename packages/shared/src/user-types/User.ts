import { Guess } from "./Guess";
import { Permission } from "./Permission";
import { Role } from "./Role";

export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public roles: Role[],
    public hours: number,
    public guesses: Guess[],
  ) {}

  /**
   * Checks whether the user has a given permission.
   *
   * Client-side:
   * Used to determine whether UI elements should be enabled,
   * disabled, or hidden.
   *
   * Server-side:
   * The user must be loaded from the authoritative data source
   * before performing this check.
   *
   * @param permission Permission to check
   * @returns true if at least one of the user's roles grants the permission
   */
  hasPermission(permission: Permission): boolean {
    return this.roles.some((role) => role.permissions.includes(permission));
  }
}
