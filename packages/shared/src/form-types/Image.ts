import { User } from "../user-types/User";
import { Form } from "./Form";

export interface ImageData {
  teamNumber: number;
  id: string;
}

export class Image implements Form<ImageData> {
  constructor(
    public readonly id: string,
    public readonly compCode: string,
    public readonly scouter: User,
    public data: ImageData,
  ) {}
}
