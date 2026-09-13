import { User } from "../user-types/User";
import { Form } from "./Form";
import { MatchData } from "./Match";

export class Practice implements Form<MatchData> {
  constructor(
    public readonly id: string,
    public readonly compCode: string,
    public readonly scouter: User,
    public data: MatchData,
  ) {}
}
