"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware"); // your auth middleware
const serviceProviderAccount_controller_1 = require("../controllers/serviceProviderAccount.controller");
const router = express_1.default.Router();
// --------------------------
// Protected routes (user must be logged in)
// --------------------------
// Create Stripe onboarding link
router.post("/onboard", auth_middleware_1.protect, serviceProviderAccount_controller_1.createStripeAccountLink);
// Get fresh seller dashboard link
router.get("/dashboard", auth_middleware_1.protect, serviceProviderAccount_controller_1.getStripeDashboardLink);
const accountRoutes = router;
exports.default = accountRoutes;
