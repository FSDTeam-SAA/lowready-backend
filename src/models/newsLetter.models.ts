import mongoose, { Schema } from 'mongoose'
import { INewsletter } from '../interface/newsLetter.interface'

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

export const Newsletter = mongoose.model<INewsletter>(
  'Newsletter',
  NewsletterSchema
)
