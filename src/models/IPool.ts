import { IUser } from "models/IUser";

export interface IPool {
  poolName: string;
  paymentType: string;
  startDate: Date;
  endDate: Date;
  users: IUser[];
}