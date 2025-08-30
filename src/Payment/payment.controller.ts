import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';
import Stripe from 'stripe';
import Payment from '../models/payment';
import {  createCheckoutSession } from './payment.service';
import SubscriptionPlan from '../subscription/subscription.model';
import { User } from '../models/user.model';

const stripe = new Stripe(process.env.Stripe_Secret_Key!, { apiVersion: '2025-08-27.basil' });

// Create payment session endpoint
export const createPayment = catchAsync(async (req: Request, res: Response) => {
  const { type, referenceId, billingCycle, amount } = req.body;
  const userId = req.user?._id;

  const sessionUrl = await createCheckoutSession(type, referenceId, userId, billingCycle, amount);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Checkout session created',
    data: { sessionUrl },
  });
});

// Stripe webhook handler
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.Webhook_Payment_Secret!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    // Successful checkout
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentRecord = await Payment.findOne({ stripeCheckoutSessionId: session.id });
      if (paymentRecord) {
        paymentRecord.status = 'paid';
        paymentRecord.stripePaymentIntentId = session.payment_intent as string;
        await paymentRecord.save();
   // ✅ Handle Subscription Payment
        if (paymentRecord.type === 'subscription' && paymentRecord.billingCycle) {
            const now = new Date();
            let subscriptionEndDate: Date;

            if (paymentRecord.billingCycle === 'monthly') {
                subscriptionEndDate = new Date(now);
                subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
            } else if (paymentRecord.billingCycle === 'yearly') {
                subscriptionEndDate = new Date(now);
                subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
            } else {
                // This case should not be reached if validation is in place
                throw new Error('Invalid billing cycle on payment record');
            }

            await User.findByIdAndUpdate(
                paymentRecord.userId,
                {
                    subscriptionPlan: paymentRecord.referenceId,
                    subscriptionStartDate: now,
                    subscriptionEndDate,
                    subscriptionStatus: 'active',
                    isSubscriptionActive: true,
                },
                { new: true }
            );

            console.log(`✅ Subscription activated for user ${paymentRecord.userId}`);
        }

        // Booking payments: optionally confirm booking
        if (paymentRecord.type === 'booking') {
          // await Facility.findByIdAndUpdate(paymentRecord.referenceId, { confirmed: true });
        }
      }
      break;
    }

    // Failed payments
    case 'checkout.session.async_payment_failed':
    case 'payment_intent.payment_failed': {
      const failedSession = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;

      const paymentRecord = await Payment.findOne({
        $or: [
          { stripeCheckoutSessionId: failedSession.id },
          { stripePaymentIntentId: failedSession.id },
        ],
      });

      if (paymentRecord) {
        paymentRecord.status = 'failed';
        await paymentRecord.save();
      }
      break;
    }

    // Transfer events
    case 'transfer.created':
    case 'transfer.paid': {
      const transfer = event.data.object as Stripe.Transfer;
      console.log(`Transfer event: ${event.type}, Transfer ID: ${transfer.id}, Amount: ${transfer.amount}`);
      // Optional: Save transfer info to DB for reporting
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }

  res.json({ received: true });
};
