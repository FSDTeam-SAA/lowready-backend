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
  roomType?: string
  serviceType?: string
}

export type VisitBookingModel = Model<IVisitBooking>
