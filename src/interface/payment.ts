import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  type: 'subscription' | 'booking';
  referenceId: mongoose.Types.ObjectId; 
  userId: mongoose.Types.ObjectId; // payer
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
    billingCycle?: 'monthly' | 'yearly'; 
  updatedAt: Date;
}

export interface PaymentModel extends Model<IPayment> {}