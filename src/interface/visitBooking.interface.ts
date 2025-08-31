import { Document, Model, Types } from 'mongoose'
import { IUser } from './user.interface'
import { IFacility } from './facility.interface'

export interface IVisitBooking extends Document {
  userId: Types.ObjectId | IUser
  name: string
  email: string
  phoneNumber: string
  relationWith: string
  message: string
  facility: Types.ObjectId | IFacility
  visitDate: Date
  visitTime: string
  rating?: number
  status: 'upcoming' | 'completed' | 'cancelled'
  feedback?: string
}

export type VisitBookingModel = Model<IVisitBooking>

// import { Document, Model, Types } from "mongoose";

// export interface IVisitBooking extends Document {
//   _id: string;
//   userId: Types.ObjectId;
//   name: string;
//   email: string;
//   phoneNumber?: string;
//   relationWith?: string;
//   message?: string;
//   facility: Types.ObjectId;
//   visitDate: Date;
//   visitTime: string;
//   status: "upcoming" | "completed" | "cancelled";
//   rating: number;
//   feedback?: string;
// }

// export interface VisitBookingModel extends Model<IVisitBooking> { }
