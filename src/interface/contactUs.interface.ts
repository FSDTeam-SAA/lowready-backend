import { Document, Model } from 'mongoose'

export interface IContactUs extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  message: string
}

export interface ContactUsModel extends Model<IContactUs> {}
