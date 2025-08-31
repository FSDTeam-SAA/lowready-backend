"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
router.post('/pay', auth_middleware_1.protect, payment_controller_1.createPayment);
const payment = router;
exports.default = payment;
