import { Document, Model, Types } from "mongoose";

// export interface IService {
//   label: string;
//   title: string;
// }

export interface IFacility extends Document {
  _id: string;
  availability: boolean;
  name: string;
  location: string;
  address: string;
  description?: string;
  price: number;
  userId: Types.ObjectId;
  images: string;
  base: "monthly" | "yearly";
  amenities: string[];
  careServices:
  | "Personal Care"
  | "Directed Care"
  | "Supervisory Care"
  | "Memory Care"
  | "Respite and Short Term Care"
  | "Behavioral Care";
  amenitiesServices: string[];
  about?: string;
  videoTitle?: string;
  videoDescription?: string;
  uploadVideo?: string[];
  availableTime: string[];
  facilityLicenseNumber?: string;
  medicaidPrograms?: string[];
  rating?: number;
}

export interface FacilityModel extends Model<IFacility> { }
