"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = __importDefault(require("../errors/AppError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendEmail_1 = require("../utils/sendEmail");
const sendMessageTemplate_1 = __importDefault(require("../utils/sendMessageTemplate"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const createContactUs = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;
        const fullName = `${firstName} ${lastName}`;
        const subject = `New Contact Us Message from ${fullName}`;
        const html = (0, sendMessageTemplate_1.default)({
            email,
            subject,
            message,
        });
        const result = await (0, sendEmail_1.sendEmail)("tahsin.bdcalling@gmail.com", subject, html);
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: "Contact us message sent successfully!",
            data: result,
        });
    }
    catch (error) {
        throw new AppError_1.default(500, "Failed to send contact us message");
    }
});
const contractUsController = {
    createContactUs,
};
exports.default = contractUsController;
