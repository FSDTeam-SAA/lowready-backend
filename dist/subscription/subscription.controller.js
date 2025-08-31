"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.getPlanById = exports.getAllPlans = exports.createPlan = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const subscription_service_1 = require("./subscription.service");
/******************
 * CREATE PLAN *
 ******************/
exports.createPlan = (0, catchAsync_1.default)(async (req, res) => {
    const plan = await (0, subscription_service_1.createSubscriptionPlan)(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Subscription plan created successfully',
        data: plan,
    });
});
/********************
 * GET ALL PLANS *
 ********************/
exports.getAllPlans = (0, catchAsync_1.default)(async (req, res) => {
    const plans = await (0, subscription_service_1.getAllSubscriptionPlans)();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All subscription plans fetched successfully',
        data: plans,
    });
});
/*********************
 * GET PLAN BY ID *
 *********************/
exports.getPlanById = (0, catchAsync_1.default)(async (req, res) => {
    const plan = await (0, subscription_service_1.getSubscriptionPlanById)(req.params.id);
    if (!plan) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Plan not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription plan fetched successfully',
        data: plan,
    });
});
/*********************
 * UPDATE PLAN *
 *********************/
exports.updatePlan = (0, catchAsync_1.default)(async (req, res) => {
    const updatedPlan = await (0, subscription_service_1.updateSubscriptionPlan)(req.params.id, req.body);
    if (!updatedPlan) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Plan not found or not updated');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription plan updated successfully',
        data: updatedPlan,
    });
});
/***********************
 * DELETE PLAN *
 ***********************/
exports.deletePlan = (0, catchAsync_1.default)(async (req, res) => {
    const deleted = await (0, subscription_service_1.deleteSubscriptionPlan)(req.params.id);
    if (!deleted) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Plan not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscription plan deleted successfully',
    });
});
