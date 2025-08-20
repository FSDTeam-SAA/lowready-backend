import { Document, Model, Types } from 'mongoose'

export interface IBlog extends Document {
  _id: string
  adminId: Types.ObjectId
  image?: string
  title: string
  description: string
}

export interface BlogModel extends Model<IBlog> {}
