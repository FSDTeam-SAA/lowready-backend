import mongoose, { Model, Schema } from "mongoose";
import { IFaq } from "../interface/faq.interface";
import { string } from "zod";

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    home: { type: Boolean, default: true },
    faq: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Faq = mongoose.model<IFaq, Model<IFaq>>("Faq", faqSchema);
