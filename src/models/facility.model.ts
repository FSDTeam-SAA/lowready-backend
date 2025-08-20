import mongoose, { Schema } from 'mongoose'
import { IFacility, FacilityModel } from '../interface/facility.interface'

const facilitySchema: Schema = new Schema<IFacility>(
  {
    availability: { type: Boolean, default: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },

    base: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },

    amenities: [{ type: String }], // array of strings
    offers: [{ type: String }], // array of strings

    services: [
      {
        label: { type: String, required: true },
        title: { type: String, required: true },
      },
    ],

    about: { type: String, default: '' },
    videoTitle: { type: String, default: '' },
    videoDescription: { type: String, default: '' },
    uploadVideo: { type: String, default: '' }, // could be Cloudinary URL or file path

    availableTime: { type: Date, required: true },
  },
  { timestamps: true }
)

export const Facility = mongoose.model<IFacility, FacilityModel>(
  'Facility',
  facilitySchema
)
