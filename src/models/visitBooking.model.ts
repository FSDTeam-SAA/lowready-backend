import mongoose, { Schema } from "mongoose";
import {
  IVisitBooking,
  VisitBookingModel,
} from "../interface/visitBooking.interface";

const visitBookingSchema: Schema = new Schema<IVisitBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"] },
    phoneNumber: { type: String, required: [true, "Phone number is required"] },
    relationWith: { type: String, required: [true, "Relation is required"] },
    message: { type: String, required: [true, "Message is required"] },
    facility: { type: Schema.Types.ObjectId, ref: "Facility", required: [true, "Facility is required"] },
    visitDate: { type: Date, required: [true, "Visit date is required"] },
    visitTime: { type: String, required: [true, "Visit time is required"] },
    rating: { type: Number, max: 5, default: 0 },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
    feedback: { type: String },
    roomType: { type: String },
    serviceType: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export const VisitBooking = mongoose.model<IVisitBooking, VisitBookingModel>(
  "VisitBooking",
  visitBookingSchema
);
