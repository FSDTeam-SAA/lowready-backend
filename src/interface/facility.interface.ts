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
  description?: string;
  price: number;
  userId: Types.ObjectId;
  images: string;
  base: "monthly" | "yearly";
  amenities: string[];
  offers: string[];
  services:
    | "Room and Board (Private or Shared Rooms)"
    | "Assistance with Activities of Daily Living"
    | "Medication Management"
    | "Meals and Nutrition"
    | "Housekeeping and Laundry "
    | "Transportation"
    | "Social and Recreational Activities"
    | "Health Monitoring and Coordination";
  about?: string;
  videoTitle?: string;
  videoDescription?: string;
  uploadVideo?: string[];
  availableTime: string[];
}

export interface FacilityModel extends Model<IFacility> {}
