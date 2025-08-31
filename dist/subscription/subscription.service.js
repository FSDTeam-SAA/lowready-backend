"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubscriptionPlan = exports.updateSubscriptionPlan = exports.getSubscriptionPlanById = exports.getAllSubscriptionPlans = exports.createSubscriptionPlan = void 0;
const subscription_model_1 = __importDefault(require("./subscription.model"));
/*********************
 * CREATE PLAN *
 *********************/
const createSubscriptionPlan = async (data) => {
    return await subscription_model_1.default.create(data);
};
exports.createSubscriptionPlan = createSubscriptionPlan;
/*********************
 * GET ALL PLANS *
 *********************/
const getAllSubscriptionPlans = async () => {
    return await subscription_model_1.default.find().sort({ createdAt: -1 });
};
exports.getAllSubscriptionPlans = getAllSubscriptionPlans;
/*********************
 * GET PLAN BY ID *
 *********************/
const getSubscriptionPlanById = async (id) => {
    return await subscription_model_1.default.findById(id);
};
exports.getSubscriptionPlanById = getSubscriptionPlanById;
/*********************
 * UPDATE PLAN *
 *********************/
const updateSubscriptionPlan = async (id, data) => {
    return await subscription_model_1.default.findByIdAndUpdate(id, data, { new: true });
};
exports.updateSubscriptionPlan = updateSubscriptionPlan;
/*********************
 * DELETE PLAN *
 *********************/
const deleteSubscriptionPlan = async (id) => {
    return await subscription_model_1.default.findByIdAndDelete(id);
};
exports.deleteSubscriptionPlan = deleteSubscriptionPlan;
