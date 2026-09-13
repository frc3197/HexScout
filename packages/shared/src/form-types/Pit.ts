import { User } from "../user-types/User";
import { Form } from "./Form";

export interface PitData {
  teamNumber: number;
  id: string;
}

export class Pit implements Form<PitData> {
  constructor(
    public readonly id: string,
    public readonly compCode: string,
    public readonly scouter: User,
    public data: PitData,
  ) {}
}
