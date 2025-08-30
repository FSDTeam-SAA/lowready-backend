import mongoose, { Schema, Types } from "mongoose";
import { IPayment } from "../interface/payment";


const paymentSchema = new Schema<IPayment>({
  type: { type: String, enum: ['subscription', 'booking'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  stripeCheckoutSessionId: { type: String },
  stripePaymentIntentId: { type: String },
    billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
  },
  
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', paymentSchema);