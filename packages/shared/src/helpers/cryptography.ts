import argon2 from "argon2";

export async function createHash(valueToHash: string): Promise<string> {
  return argon2.hash(valueToHash);
}

export async function checkHash(
  value: string,
  hash: string
): Promise<boolean> {
  return argon2.verify(hash, value);
}