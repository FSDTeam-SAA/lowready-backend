import mongoose, { Schema } from "mongoose";
import { IFacility, FacilityModel } from "../interface/facility.interface";

const facilitySchema: Schema = new Schema<IFacility>(
  {
    availability: { type: Boolean, default: true },
    name: { type: String, required: true, message: "Name is required" },
    location: { type: String, required: true, message: "Location is required" },
    description: {
      type: String,
      required: true,
      message: "Description is required",
    },
    price: { type: Number, required: true, message: "Price is required" },
    image: { type: String, required: true, message: "Image is required" },
    base: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
      message: "Select a base plan",
    },
    amenities: [
      { type: String, required: true, message: "Add at least one amenity" },
    ],
    offers: [
      { type: String, required: true, message: "Add at least one offer" },
    ],
    services: [
      {
        label: { type: String, required: true },
        title: { type: String, required: true },
        message: "Service label and title are required",
      },
    ],
    about: { type: String, required: true, message: "About is required" },
    videoTitle: {
      type: String,
      required: true,
      message: "Video title is required",
    },
    videoDescription: {
      type: String,
      required: true,
      message: "Video description is required",
    },
    uploadVideo: {
      type: String,
      required: true,
      message: "Upload video is required",
    },
    availableTime: [
      { type: Date, required: true, message: "Available time is required" },
    ],
  },
  { timestamps: true }
);

export const Facility = mongoose.model<IFacility, FacilityModel>(
  "Facility",
  facilitySchema
);
