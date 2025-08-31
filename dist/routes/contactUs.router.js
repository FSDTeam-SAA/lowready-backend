"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactUs_controller_1 = __importDefault(require("../controllers/contactUs.controller"));
const router = (0, express_1.Router)();
router.post("/send-message", contactUs_controller_1.default.createContactUs);
const contactUsRouter = router;
exports.default = contactUsRouter;
