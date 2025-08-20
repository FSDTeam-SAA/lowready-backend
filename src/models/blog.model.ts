import mongoose, { Schema } from 'mongoose'
import { IBlog, BlogModel } from '../interface/blog.interface'

const blogSchema: Schema = new Schema<IBlog>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: String, default: '' }, // image URL or file path
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
)

export const Blog = mongoose.model<IBlog, BlogModel>('Blog', blogSchema)
