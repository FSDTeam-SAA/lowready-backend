import mongoose, { Schema } from "mongoose";
import { IFacility, FacilityModel } from "../interface/facility.interface";

const facilitySchema: Schema = new Schema<IFacility>(
  {
    availability: { type: Boolean, default: true },
    name: { type: String, required: [true, "Name is required"] },
    location: { type: String, required: [true, "Location is required"] },
    address: { type: String, required: [true, "Address is required"] },
    description: { type: String, required: [true, "Description is required"] },
    price: { type: Number, required: [true, "Price is required"] },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    images: [
      {
        public_id: {
          type: String,
          default: "",
        },
        url: { type: String, default: "" },
      },
    ],
    base: {
      type: String,
      enum: ["monthly", "yearly"],
      required: [true, "Select a base plan"],
    },
    careServices: [
      {
        type: String,
        enum: [
          "Personal Care",
          "Directed Care",
          "Supervisory Care",
          "Memory Care",
          "Respite and Short Term Care",
          "Behavioral Care",
        ],
        required: [true, "Select at least one amenity"],
      },
    ],
    amenities: [{ type: String, required: [true, "Amenity is required"] }],
    amenitiesServices: [
      {
        name: { type: String, required: [true, "Name is required"] },
        image: {
          public_id: { type: String, default: "" },
          url: { type: String, default: "" },
        },
        _id: false,
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
      { type: String, required: [true, "Available time is required"] },
    ],
    facilityLicenseNumber: {
      type: String,
    },
    medicaidPrograms: [
      {
        public_id: {
          type: String,
          default: "",
        },
        url: { type: String, default: "" },
      },
      { _id: false },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "declined"],
      default: "pending",
    },
    totalTour: { type: Number, default: 0 },
    totalPlacement: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Facility = mongoose.model<IFacility, FacilityModel>(
  "Facility",
  facilitySchema
);
