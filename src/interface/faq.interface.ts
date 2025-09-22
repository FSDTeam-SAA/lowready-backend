import { Document, Model } from "mongoose";

export interface IFaq extends Document {
  question: string;
  answer: string;
}

export type FaqModel = Model<IFaq>;
