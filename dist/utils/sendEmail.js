"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.APP_USER,
                pass: process.env.APP_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.APP_USER, // better to use env
            to,
            subject: subject || 'Password change Link : change it by 10 minutes',
            html,
        });
        return {
            success: true,
            message: 'Email sent successfully',
        };
    }
    catch (error) {
        console.error('Email send failed:', error?.message || error);
        // Handle Gmail-specific quota error
        if (error?.response?.includes('Daily user sending limit exceeded') ||
            error?.message?.includes('Daily user sending limit exceeded')) {
            return {
                success: false,
                message: 'Daily sending limit exceeded. Please try again after 24 hours or use another email service.',
                error,
            };
        }
        return {
            success: false,
            message: 'Failed to send email',
            error,
        };
    }
};
exports.sendEmail = sendEmail;
