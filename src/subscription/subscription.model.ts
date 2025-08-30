import mongoose, { Document, Schema } from 'mongoose';
import { ISubscriptionPlan } from '../interface/subscription';



const subscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly', 'weekly', 'custom'],
    default: 'monthly',
  },
 
  isActive: {
    type: Boolean,
    default: true,
  },
  features: [
    {
      type: String,
    },
  ],

}, { timestamps: true });

const SubscriptionPlan = mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;
