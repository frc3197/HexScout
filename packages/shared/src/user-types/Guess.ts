export type Alliance = "Red" | "Blue";

export type Wager = 1 | 2 | 3 | 4 | 5 | "All";

export class Guess {
  constructor(
    public matchNumber: number,
    public winningAlliance: Alliance,
    public wager: Wager,
  ) {}
}
