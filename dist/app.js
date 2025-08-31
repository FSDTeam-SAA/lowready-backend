"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const notFound_1 = require("./middlewares/notFound");
const routes_1 = __importDefault(require("./routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const serviceProviderAccount_controller_1 = require("./controllers/serviceProviderAccount.controller");
const payment_controller_1 = require("./Payment/payment.controller");
const app = (0, express_1.default)();
app.post('/api/v1/webhook', express_1.default.raw({ type: '*/*' }), serviceProviderAccount_controller_1.stripeWebhook);
app.post('/api/v1/payment/webhook', express_1.default.raw({ type: '*/*' }), payment_controller_1.stripeWebhookHandler);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
//corse setup :
const corsOptions = {
    origin: "*",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// app.use('/api/users', userRoutes)
app.use("/api/v1", routes_1.default);
app.use(notFound_1.notFound);
app.use(globalErrorHandler_1.globalErrorHandler);
exports.default = app;
