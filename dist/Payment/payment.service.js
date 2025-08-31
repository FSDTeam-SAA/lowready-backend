"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = void 0;
const stripe_1 = __importDefault(require("stripe"));
const mongoose_1 = __importDefault(require("mongoose"));
const facility_model_1 = require("../models/facility.model");
const user_model_1 = require("../models/user.model");
const subscription_model_1 = __importDefault(require("../subscription/subscription.model"));
const payment_1 = __importDefault(require("../models/payment"));
const stripe = new stripe_1.default(process.env.Stripe_Secret_Key, { apiVersion: '2025-08-27.basil' });
const createCheckoutSession = async (type, referenceId, userId, billingCycle, amount) => {
    let lineItemAmount = 0;
    let lineItemName = '';
    let transferData;
    if (type === 'booking') {
        const booking = await facility_model_1.Facility.findById(referenceId);
        if (!booking)
            throw new Error('Booking not found');
        const organization = await user_model_1.User.findById(booking.userId);
        if (!organization || !organization.onboardingStatus || !organization.stripeAccountId) {
            throw new Error('Organization not onboarded or missing Stripe account');
        }
        lineItemAmount = booking.price * 100; // cents
        lineItemName = booking.name;
        transferData = {
            destination: organization.stripeAccountId,
            amount: Math.floor(lineItemAmount * 0.82),
        };
    }
    else if (type === 'subscription') {
        if (!billingCycle)
            throw new Error('Billing cycle required for subscription');
        const plan = await subscription_model_1.default.findById(referenceId);
        if (!plan || !plan.isActive)
            throw new Error('Subscription plan not found or inactive');
        lineItemAmount = (billingCycle === 'yearly' ? (amount || plan.price * 12) : (amount || plan.price)) * 100;
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
        success_url: `https://your-frontend.com/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://your-frontend.com/payment-cancel`,
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
    await payment_1.default.create({
        type,
        referenceId: new mongoose_1.default.Types.ObjectId(referenceId),
        userId: new mongoose_1.default.Types.ObjectId(userId),
        amount: lineItemAmount / 100,
        currency: 'usd',
        status: 'pending',
        stripeCheckoutSessionId: session.id,
        billingCycle: type === 'subscription' ? billingCycle : undefined, // save session ID instead of payment_intent
    });
    return session.url; // <-- This is your payment URL
};
exports.createCheckoutSession = createCheckoutSession;
