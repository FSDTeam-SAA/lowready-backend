import mongoose, { Schema, Model } from 'mongoose'
import { IBookHome, IResidentialInfo } from '../interface/bookHome.interface'

const residentialInfoSchema = new Schema<IResidentialInfo>(
  {
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    requirements: { type: String, default: '' },
  },
  { _id: false } // prevent extra ObjectId for each entry
)

const bookHomeSchema = new Schema<IBookHome>(
  {
    facility: { type: Schema.Types.ObjectId, ref: 'Facility', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startingDate: { type: Date, required: true },
    duration: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['paid', 'canceled', 'pending'],
      default: 'paid',
    },
    residentialInfo: [residentialInfoSchema],
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
)

export const BookHome: Model<IBookHome> = mongoose.model<IBookHome>(
  'BookHome',
  bookHomeSchema
)
