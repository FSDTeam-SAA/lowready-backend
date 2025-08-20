import mongoose, { Schema } from 'mongoose'
import {
  IVisitBooking,
  VisitBookingModel,
} from '../interface/visitBooking.interface'

const visitBookingSchema: Schema = new Schema<IVisitBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    relationWith: { type: String, default: '' }, // relation with facility or user
    message: { type: String, default: '' },
    facility: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
  },
  { timestamps: true }
)

export const VisitBooking = mongoose.model<IVisitBooking, VisitBookingModel>(
  'VisitBooking',
  visitBookingSchema
)
