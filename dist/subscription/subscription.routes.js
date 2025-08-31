"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const subscription_controller_1 = require("./subscription.controller");
const router = express_1.default.Router();
router.post('/create', auth_middleware_1.protect, auth_middleware_1.isAdmin, subscription_controller_1.createPlan); // Only admin can create
router.get('/get', subscription_controller_1.getAllPlans); // Only admin can view all plans
router.get('/:id', auth_middleware_1.protect, subscription_controller_1.getPlanById); // Anyone can view a plan by ID
router.put('/update/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, subscription_controller_1.updatePlan); // Only admin can update
router.delete('/delete/:id', auth_middleware_1.protect, auth_middleware_1.isAdmin, subscription_controller_1.deletePlan); // Only admin can delete
const subscription = router;
exports.default = subscription;
