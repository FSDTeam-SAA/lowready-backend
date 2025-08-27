import express from "express";

import { protect } from "../middlewares/auth.middleware"; // your auth middleware
import { createStripeAccountLink, getStripeDashboardLink } from "../controllers/serviceProviderAccount.controller";

const router = express.Router();

// --------------------------
// Protected routes (user must be logged in)
// --------------------------

// Create Stripe onboarding link
router.post("/onboard", protect, createStripeAccountLink);

// Get fresh seller dashboard link
router.get("/dashboard", protect, getStripeDashboardLink);

const  accountRoutes= router
export default accountRoutes;
