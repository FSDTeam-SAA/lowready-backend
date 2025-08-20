import mongoose, { Schema } from 'mongoose'
import { IContactUs, ContactUsModel } from '../interface/contactUs.interface'

const contactUsSchema: Schema = new Schema<IContactUs>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, default: '' },
    message: { type: String, required: true },
  },
  { timestamps: true }
)

export const ContactUs = mongoose.model<IContactUs, ContactUsModel>(
  'ContactUs',
  contactUsSchema
)
