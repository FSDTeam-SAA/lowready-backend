import { Document, Model, Types } from "mongoose";

export interface IUserDocument extends Document {
  uploader:Types.ObjectId | string;
  type: "Identity & Legal Documents" | "Business & License Documents" | "Professional & Qualifications Documents" | "Health & Safety Documents";
  file: {
    url: string;
    public_id: string;
  };
}