import { User } from "../user-types/User";

export interface Form<TData = object> {
  readonly id: string;
  readonly compCode: string;
  scouter: User;
  data: TData;
}
