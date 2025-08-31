"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastNewsletter = exports.subscribeNewsletter = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const newsLetter_models_1 = require("../models/newsLetter.models");
const sendEmail_1 = require("../utils/sendEmail");
exports.subscribeNewsletter = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Email is required');
    }
    const existing = await newsLetter_models_1.Newsletter.findOne({ email });
    if (existing) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: 'Already subscribed',
            data: existing,
        });
    }
    const subscriber = await newsLetter_models_1.Newsletter.create({ email });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Subscribed successfully',
        data: subscriber,
    });
});
exports.broadcastNewsletter = (0, catchAsync_1.default)(async (req, res) => {
    const { subject, html } = req.body;
    if (!subject || !html) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Subject and HTML content are required');
    }
    const subscribers = await newsLetter_models_1.Newsletter.find();
    const emails = subscribers.map((s) => s.email);
    await Promise.all(emails.map((email) => (0, sendEmail_1.sendEmail)(email, subject, html)));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Email sent to all newsletter subscribers',
        data: {},
    });
});
