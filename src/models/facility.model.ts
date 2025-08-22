import mongoose, { Schema } from "mongoose";
import { IFacility, FacilityModel } from "../interface/facility.interface";

const facilitySchema: Schema = new Schema<IFacility>(
  {
    availability: { type: Boolean, default: true },
    name: { type: String, required: [true, "Name is required"] },
    location: { type: String, required: [true, "Location is required"] },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"] },
    image: {
      public_id: {
        type: String,
        default: "",
        required: [true, "Image public_id is required"],
      },
      url: {
        type: String,
        default: "",
        required: [true, "Image URL is required"],
      },
    },
    base: {
      type: String,
      enum: ["monthly", "yearly"],
      required: [true, "Select a base plan"],
    },
    amenities: [{ type: String, required: [true, "Add at least one amenity"] }],
    offers: [{ type: String, required: [true, "Add at least one offer"] }],
    services: [
      {
        label: { type: String, required: [true, "Service label is required"] },
        title: { type: String, required: [true, "Service title is required"] },
      },
    ],
    about: { type: String, required: [true, "About is required"] },
    videoTitle: { type: String, required: [true, "Video title is required"] },
    videoDescription: {
      type: String,
      required: [true, "Video description is required"],
    },
    uploadVideo: { type: String, default: "" },
    availableTime: [
      { type: Date, required: [true, "Available time is required"] },
    ],
  },
  { timestamps: true }
);

export const Facility = mongoose.model<IFacility, FacilityModel>(
  "Facility",
  facilitySchema
);
