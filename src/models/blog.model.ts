import mongoose, { Schema } from "mongoose";
import { IBlog, BlogModel } from "../interface/blog.interface";

const blogSchema: Schema = new Schema<IBlog>(
  {
    image: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const Blog = mongoose.model<IBlog, BlogModel>("Blog", blogSchema);
