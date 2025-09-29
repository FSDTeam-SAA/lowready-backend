import { Document, Model, Types } from "mongoose";
import { IUser } from "./user.interface";

export interface IFacility extends Document {
  availability: "available" | "unavailable" | "limited";
  name: string;
  location: string;
  address: string;
  description: string;
  price: number;
  userId: Types.ObjectId | IUser;
  images: { public_id: string; url: string }[];
  base: "monthly" | "yearly";
  careServices: string[];
  amenities: string[];
  amenitiesServices: {
    name: string;
    image: { public_id: string; url: string };
  }[];
  about: string;
  videoTitle: string;
  videoDescription: string;
  uploadVideo: string;
  availableTime: string[];
  facilityLicenseNumber?: string;
  medicaidPrograms: { public_id: string; url: string }[];
  rating: number;
  ratingCount: number;
  status: "approved" | "pending" | "declined";
  totalTour: number;
  totalPlacement: number;
  isFeatured: boolean;
}

export type FacilityModel = Model<IFacility>;

// import { Document, Model, Types } from "mongoose";

// // export interface IService {
// //   label: string;
// //   title: string;
// // }

// export interface IFacility extends Document {
//   _id: string;
//   availability: boolean;
//   name: string;
//   location: string;
//   address: string;
//   description?: string;
//   price: number;
//   userId: Types.ObjectId;
//   images: string;
//   base: "monthly" | "yearly";
//   amenities: string[];
//   careServices:
//   | "Personal Care"
//   | "Directed Care"
//   | "Supervisory Care"
//   | "Memory Care"
//   | "Respite and Short Term Care"
//   | "Behavioral Care";
//   amenitiesServices: string[];
//   about?: string;
//   videoTitle?: string;
//   videoDescription?: string;
//   uploadVideo?: string[];
//   availableTime: string[];
//   facilityLicenseNumber?: string;
//   medicaidPrograms?: string[];
//   rating?: number;
//   ratingCount?: number;
//   status?: "approved" | "pending" | "declined";
//   totalTour: number
//   totalPlacement: number
// }

// export interface FacilityModel extends Model<IFacility> { }
