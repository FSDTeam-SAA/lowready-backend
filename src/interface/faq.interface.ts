import { Document, Model } from "mongoose";

export interface IFaq extends Document {
  question: string;
  answer: string;
  home: Boolean;
  faq: Boolean;
}

export type FaqModel = Model<IFaq>;
