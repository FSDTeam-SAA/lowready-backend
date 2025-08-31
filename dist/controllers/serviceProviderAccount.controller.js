"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.getStripeDashboardLink = exports.createStripeAccountLink = void 0;
const stripe_1 = __importDefault(require("stripe"));
const user_model_1 = require("../models/user.model");
const stripe = new stripe_1.default(process.env.Stripe_Secret_Key, {
    // @ts-ignore
    apiVersion: "2025-07-30.basil",
});
/**
 * Create Stripe onboarding link for user
 */
const createStripeAccountLink = async (req, res) => {
    const userId = req.user?._id;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        return res.status(404).json({ success: false, message: "User not found" });
    // Create Stripe account if it doesn't exist
    if (!user.stripeAccountId) {
        const account = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });
        user.stripeAccountId = account.id;
        await user.save();
    }
    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
        account: user.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/onboard/refresh`,
        return_url: `${process.env.FRONTEND_URL}/onboard/success`,
        type: "account_onboarding",
    });
    res.status(200).json({ success: true, url: accountLink.url });
};
exports.createStripeAccountLink = createStripeAccountLink;
/**
 * Generate fresh Stripe seller dashboard login link
 */
const getStripeDashboardLink = async (req, res) => {
    const userId = req.user?._id;
    const user = await user_model_1.User.findById(userId);
    if (!user || !user.stripeAccountId)
        return res.status(404).json({ success: false, message: "Stripe account not found" });
    // Generate a fresh login link every time (link expires in 24h)
    const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);
    // Optional: store last generated link
    user.accountLink = loginLink.url;
    await user.save();
    res.status(200).json({ success: true, url: loginLink.url });
};
exports.getStripeDashboardLink = getStripeDashboardLink;
/**
 * Stripe webhook: handles snapshot & thin payloads for all account events
 */
const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.Webhook_Account_Secret);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const account = event.data.object;
    const user = await user_model_1.User.findOne({ stripeAccountId: account?.id });
    if (!user)
        return res.sendStatus(200); // Ignore events for other accounts
    try {
        switch (event.type) {
            case "account.updated":
                // Update onboardingStatus based on capabilities & submitted requirements
                const pendingFields = account.requirements?.currently_due || [];
                if (pendingFields.length > 0) {
                    user.onboardingStatus = false;
                }
                else if (account.charges_enabled &&
                    account.payouts_enabled &&
                    account.capabilities?.card_payments === "active" &&
                    account.capabilities?.transfers === "active") {
                    user.onboardingStatus = true;
                }
                await user.save();
                break;
            case "account.external_account.created":
            case "account.external_account.updated":
            case "account.external_account.deleted":
                // Optional: handle bank account changes
                break;
            case "account.application.deauthorized":
                // User disconnected Stripe
                user.onboardingStatus = false;
                await user.save();
                break;
            default:
                // log or ignore other events
                break;
        }
        res.sendStatus(200);
    }
    catch (err) {
        console.error("Stripe webhook handling error:", err);
        res.sendStatus(500);
    }
};
exports.stripeWebhook = stripeWebhook;
