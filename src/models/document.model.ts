import mongoose,{ Schema } from "mongoose";
import { IUserDocument } from "../interface/document.interface";


const documentSchema = new Schema<IUserDocument>(
  {
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
    type: String,
     enum: ["Identity & Legal Documents" ,"Business & License Documents" , "Professional & Qualifications Documents" , "Health & Safety Documents"],
    required: true,
    },
    file: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const UserDocument =
  mongoose.model<IUserDocument>("UserDocument", documentSchema);