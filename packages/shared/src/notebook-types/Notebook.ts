import { Entry } from "./Entry";

export class Notebook {
  constructor(
    public readonly id: string,
    public title: string,
    public readonly type: "private" | "public",
    public data: Entry,
  ) {}
}
