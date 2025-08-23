import mongoose, { Schema } from "mongoose";
import { IContactUs, ContactUsModel } from "../interface/contactUs.interface";

const contactUsSchema: Schema = new Schema<IContactUs>(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phoneNumber: { type: String, required: [true, "Phone number is required"] },
    message: { type: String, required: [true, "Message is required"] },
  },
  { timestamps: true }
);

export const ContactUs = mongoose.model<IContactUs, ContactUsModel>(
  "ContactUs",
  contactUsSchema
);
