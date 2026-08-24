export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public expiresAt: Date,
  ) {}

  isExpired(now = new Date()): boolean {
    return now >= this.expiresAt;
  }

  extend(durationMs: number, now = new Date()): void {
    this.expiresAt = new Date(now.getTime() + durationMs);
  }
}