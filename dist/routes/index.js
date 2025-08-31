"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facility_router_1 = require("./facility.router");
const user_routes_1 = __importDefault(require("./user.routes"));
const reviewRating_routes_1 = __importDefault(require("./reviewRating.routes"));
const blog_router_1 = __importDefault(require("./blog.router"));
const contactUs_router_1 = __importDefault(require("./contactUs.router"));
const visitBooking_router_1 = __importDefault(require("./visitBooking.router"));
const bookHome_route_1 = __importDefault(require("./bookHome.route"));
const document_routes_1 = __importDefault(require("./document.routes"));
const account_routes_1 = __importDefault(require("./account.routes"));
const notification_route_1 = __importDefault(require("./notification.route"));
const newsLetter_route_1 = __importDefault(require("./newsLetter.route"));
const dashboardSummery_router_1 = __importDefault(require("./dashboardSummery.router"));
const subscription_routes_1 = __importDefault(require("../subscription/subscription.routes"));
const payment_routes_1 = __importDefault(require("../Payment/payment.routes"));
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/facility',
        route: facility_router_1.facilityRouter,
    },
    {
        path: '/user',
        route: user_routes_1.default,
    },
    {
        path: '/review-rating',
        route: reviewRating_routes_1.default,
    },
    {
        path: '/blog',
        route: blog_router_1.default,
    },
    {
        path: '/contactUs',
        route: contactUs_router_1.default,
    },
    {
        path: '/visit-booking',
        route: visitBooking_router_1.default,
    },
    {
        path: '/bookings',
        route: bookHome_route_1.default,
    },
    {
        path: '/document',
        route: document_routes_1.default,
    },
    {
        path: '/account',
        route: account_routes_1.default,
    },
    {
        path: '/notifications',
        route: notification_route_1.default,
    },
    {
        path: '/newsletter',
        route: newsLetter_route_1.default,
    },
    {
        path: "/dashboard",
        route: dashboardSummery_router_1.default
    },
    {
        path: '/subscription',
        route: subscription_routes_1.default,
    },
    {
        path: '/payment',
        route: payment_routes_1.default,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
