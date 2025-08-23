import { Document, Types } from 'mongoose'

export interface IResidentialInfo {
  name: string
  dateOfBirth: Date
  gender: 'male' | 'female'
  requirements?: string
}

export interface IBookHome extends Document {
  facility: Types.ObjectId
  userId: Types.ObjectId
  startingDate: Date
  duration: string
  paymentStatus: 'paid' | 'canceled'| 'pending'
  residentialInfo: IResidentialInfo[]
  totalPrice: number
}
