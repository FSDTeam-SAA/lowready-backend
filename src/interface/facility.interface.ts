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
  services: string[]; // not sure about this
  offers: string[];
  amenities:
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
  Medicaid: boolean; // not sure about this
}

export interface FacilityModel extends Model<IFacility> {}
