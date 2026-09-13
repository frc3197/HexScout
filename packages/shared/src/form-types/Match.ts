import { User } from "../user-types/User";
import { Form } from "./Form";

export interface MatchData {
  teamNumber: number;
  id: string;
}

export class Match implements Form<MatchData> {
  constructor(
    public readonly id: string,
    public readonly compCode: string,
    public readonly scouter: User,
    public data: MatchData,
  ) {}
}
