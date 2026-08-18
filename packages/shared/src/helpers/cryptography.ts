import argon2 from "argon2";

/**
 * Hashes a user password.
 * Generates an encoded string containing the salt, parameters, and hash.
 */
export async function createHash(valueToHash: string): Promise<string> {
  return argon2.hash(valueToHash, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Checks a plaintext password against the stored string hash.
 * Automatically parses out the unique salt and parameters from the hash string.
 */
export async function checkHash(value: string, hash: string): Promise<boolean> {
  // Constant-time verification prevents side-channel attacks
  return argon2.verify(hash, value);
}
