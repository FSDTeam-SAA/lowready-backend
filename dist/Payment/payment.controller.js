"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhookHandler = exports.createPayment = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const stripe_1 = __importDefault(require("stripe"));
const payment_1 = __importDefault(require("../models/payment"));
const payment_service_1 = require("./payment.service");
const user_model_1 = require("../models/user.model");
const stripe = new stripe_1.default(process.env.Stripe_Secret_Key, { apiVersion: '2025-08-27.basil' });
// Create payment session endpoint
exports.createPayment = (0, catchAsync_1.default)(async (req, res) => {
    const { type, referenceId, billingCycle, amount } = req.body;
    const userId = req.user?._id;
    const sessionUrl = await (0, payment_service_1.createCheckoutSession)(type, referenceId, userId, billingCycle, amount);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Checkout session created',
        data: { sessionUrl },
    });
});
// Stripe webhook handler
const stripeWebhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.Webhook_Payment_Secret);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        // Successful checkout
        case 'checkout.session.completed': {
            const session = event.data.object;
            const paymentRecord = await payment_1.default.findOne({ stripeCheckoutSessionId: session.id });
            if (paymentRecord) {
                paymentRecord.status = 'paid';
                paymentRecord.stripePaymentIntentId = session.payment_intent;
                await paymentRecord.save();
                // ✅ Handle Subscription Payment
                if (paymentRecord.type === 'subscription' && paymentRecord.billingCycle) {
                    const now = new Date();
                    let subscriptionEndDate;
                    if (paymentRecord.billingCycle === 'monthly') {
                        subscriptionEndDate = new Date(now);
                        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
                    }
                    else if (paymentRecord.billingCycle === 'yearly') {
                        subscriptionEndDate = new Date(now);
                        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
                    }
                    else {
                        // This case should not be reached if validation is in place
                        throw new Error('Invalid billing cycle on payment record');
                    }
                    await user_model_1.User.findByIdAndUpdate(paymentRecord.userId, {
                        subscriptionPlan: paymentRecord.referenceId,
                        subscriptionStartDate: now,
                        subscriptionEndDate,
                        subscriptionStatus: 'active',
                        isSubscriptionActive: true,
                    }, { new: true });
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
            const failedSession = event.data.object;
            const paymentRecord = await payment_1.default.findOne({
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
        // @ts-ignore
        case 'transfer.paid': {
            const transfer = event.data.object;
            console.log(`Transfer event: ${event.type}, Transfer ID: ${transfer.id}, Amount: ${transfer.amount}`);
            // Optional: Save transfer info to DB for reporting
            break;
        }
        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }
    res.json({ received: true });
};
exports.stripeWebhookHandler = stripeWebhookHandler;
