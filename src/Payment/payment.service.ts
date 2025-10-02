import Stripe from 'stripe';
import mongoose from 'mongoose';
import { Facility } from '../models/facility.model';
import { User } from '../models/user.model';
import SubscriptionPlan from '../subscription/subscription.model';
import Payment from '../models/payment';
import { Schema } from 'zod';

const stripe = new Stripe(process.env.Stripe_Secret_Key!, { apiVersion: '2025-08-27.basil' });

export const createCheckoutSession = async (
  type: 'subscription' | 'booking',
  referenceId: string,
  userId: string,
  billingCycle?: 'monthly' | 'yearly',
  amount?: number
) => {
  let lineItemAmount = 0;
  let lineItemName = '';
  let transferData: Stripe.Checkout.SessionCreateParams.PaymentIntentData.TransferData | undefined;

  if (type === 'booking') {
    const booking = await Facility.findById(referenceId);
    if (!booking) throw new Error('Booking not found');

    const organization = await User.findById(booking.userId);
    if (!organization || !organization.onboardingStatus || !organization.stripeAccountId) {
      throw new Error('Organization not onboarded or missing Stripe account');
    }

    lineItemAmount = booking.price * 100; // cents
    lineItemName = booking.name;

    transferData = {
      destination: organization.stripeAccountId,
      amount: Math.floor(lineItemAmount * 0.82),
    };

  } else if (type === 'subscription') {
    if (!billingCycle) throw new Error('Billing cycle required for subscription');

    const plan = await SubscriptionPlan.findById(referenceId);
    if (!plan || !plan.isActive) throw new Error('Subscription plan not found or inactive');

   const planPriceCents = Math.round(plan.price * 100); 

    if (billingCycle === 'yearly') {
      lineItemAmount = amount
        ? Math.round(amount * 100) 
        : planPriceCents * 12;
    } else {
      lineItemAmount = amount
        ? Math.round(amount * 100)
        : planPriceCents;
    };
    lineItemName = `${plan.name} (${billingCycle})`;
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: lineItemName },
        unit_amount: lineItemAmount,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    payment_intent_data: {
      metadata: {
        type,
        referenceId: referenceId.toString(),
        userId: userId.toString(),
        ...(billingCycle ? { billingCycle } : {}),
      },
      transfer_data: transferData,
    },
  });

  // Save payment record as pending
  // Save payment record with Checkout session ID
await Payment.create({
  type,
  referenceId: new mongoose.Types.ObjectId(referenceId),
  userId: new mongoose.Types.ObjectId(userId),
  amount: lineItemAmount / 100,
  currency: 'usd',
  status: 'pending',
  stripeCheckoutSessionId: session.id,
   billingCycle: type === 'subscription' ? billingCycle : undefined, // save session ID instead of payment_intent
});

  return session.url; // <-- This is your payment URL
};


