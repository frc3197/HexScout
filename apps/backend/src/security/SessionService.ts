import { Session } from "./Session.ts";
import { randomBytes, createHash } from "node:crypto";

function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const sessions = new Map<string, Session>();

class SessionService {
  create(userId: string): string {
    const token = generateToken();
    const hash = hashToken(token);

    const session = new Session(
      hash,
      userId,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    sessions.set(hash, session);

    return token;
  }

  get(token: string): Session | null {
    const hash = hashToken(token);
    const session = sessions.get(hash);

    if (!session || session.isExpired()) {
      sessions.delete(hash);
      return null;
    }

    return session;
  }

  destroy(token: string): void {
    const hash = hashToken(token);
    sessions.delete(hash);
  }
}

export default new SessionService();
