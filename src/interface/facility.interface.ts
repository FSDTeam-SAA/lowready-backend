import { Document, Model } from "mongoose";

export interface IService {
  label: string;
  title: string;
}

export interface IFacility extends Document {
  _id: string;
  availability: boolean;
  name: string;
  location: string;
  description?: string;
  price: number;
  image: string;
  base: "monthly" | "yearly";
  amenities: string[];
  offers: string[];
  services: IService[];
  about?: string;
  videoTitle?: string;
  videoDescription?: string;
  uploadVideo?: string[];
  availableTime: Date;
}

export interface FacilityModel extends Model<IFacility> {}
