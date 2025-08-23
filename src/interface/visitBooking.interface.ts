import { Document, Model, Types } from "mongoose";

export interface IVisitBooking extends Document {
  _id: string;
  userId: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber?: string;
  relationWith?: string;
  message?: string;
  facility: Types.ObjectId;
  visitDate: Date;
  visitTime: string;
}

export interface VisitBookingModel extends Model<IVisitBooking> {}
