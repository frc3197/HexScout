export class Entry {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly type: "Note" | "Sheet",
    public data: string,
  ) {}
}
