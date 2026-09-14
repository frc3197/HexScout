export type Alliance = "Red" | "Blue";

export type Wager = 1 | 5 | 10;

export class Guess {
  constructor(
    public matchNumber: number,
    public winningAlliance: Alliance,
    public wager: Wager,
  ) {}
}
