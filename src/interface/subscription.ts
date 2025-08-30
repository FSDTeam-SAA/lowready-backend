import { Document, Types } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'custom';
  trialPeriodDays: number;
  isActive: boolean;
  features: string[];
  // Optional field for additional metadata (e.g., createdAt, updatedAt)
  createdAt?: Date;
  updatedAt?: Date;
}
