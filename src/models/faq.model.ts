import mongoose, { Model, Schema } from "mongoose";
import { IFaq } from "../interface/faq.interface";

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

export const Faq = mongoose.model<IFaq, Model<IFaq>>("Faq", faqSchema);
