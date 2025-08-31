"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyEarnings = void 0;
const bookHome_model_1 = require("../models/bookHome.model");
const facility_model_1 = require("../models/facility.model");
const payment_1 = __importDefault(require("../models/payment"));
const user_model_1 = require("../models/user.model");
const visitBooking_model_1 = require("../models/visitBooking.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const getAdminDashboardSummery = (0, catchAsync_1.default)(async (req, res) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    // 📅 Current month range
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
    // 📅 Previous month range
    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1);
    const startOfCurrentMonthCopy = new Date(currentYear, currentMonth, 1);
    const calcGrowth = (now, prev) => {
        if (prev === 0)
            return now > 0 ? 100 : 0;
        const growth = ((now - prev) / prev) * 100;
        return Math.min(100, Math.max(-100, Number(growth.toFixed(1))));
    };
    // 🏢 Facilities
    const facilitiesNow = await facility_model_1.Facility.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const facilitiesLast = await facility_model_1.Facility.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });
    // 👥 Service Providers
    const serviceProvidersNow = await user_model_1.User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const serviceProvidersLast = await user_model_1.User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });
    // 👤 Customers
    const customersNow = await user_model_1.User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const customersLast = await user_model_1.User.countDocuments({
        role: 'user',
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });
    // 📅 Bookings
    const visitToursNow = await visitBooking_model_1.VisitBooking.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const visitToursLast = await visitBooking_model_1.VisitBooking.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });
    const facilityBookingsNow = await bookHome_model_1.BookHome.countDocuments({
        createdAt: { $gte: startOfCurrentMonth, $lt: startOfNextMonth },
    });
    const facilityBookingsLast = await bookHome_model_1.BookHome.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonthCopy },
    });
    const totalBookingsNow = visitToursNow + facilityBookingsNow;
    const totalBookingsLast = visitToursLast + facilityBookingsLast;
    // console.log({
    //     "facility": "facility",
    //     "this month": facilitiesNow,
    //     "last month": facilitiesLast,
    //     "this month - last month": facilitiesNow - facilitiesLast,
    //     "this month %": calcGrowth(facilitiesNow, facilitiesLast),
    // })
    // console.log({
    //     "service provider": "service provider",
    //     "this month": serviceProvidersNow,
    //     "last month": serviceProvidersLast,
    //     "this month - last month": serviceProvidersNow - serviceProvidersLast,
    //     "this month %": calcGrowth(serviceProvidersNow, serviceProvidersLast),
    // })
    // console.log({
    //     "customer": "customer",
    //     "this month": customersNow,
    //     "last month": customersLast,
    //     "this month - last month": customersNow - customersLast,
    //     "this month %": calcGrowth(customersNow, customersLast),
    // })
    // console.log({
    //     "booking": "booking",
    //     "this month": totalBookingsNow,
    //     "last month": totalBookingsLast,
    //     "this month - last month": totalBookingsNow - totalBookingsLast,
    //     "this month %": calcGrowth(totalBookingsNow, totalBookingsLast),
    // })
    // 📊 Summary
    const summary = {
        totalFacilities: facilitiesNow,
        facilitiesGrowth: calcGrowth(facilitiesNow, facilitiesLast),
        totalServiceProviders: serviceProvidersNow,
        serviceProvidersGrowth: calcGrowth(serviceProvidersNow, serviceProvidersLast),
        totalCustomers: customersNow,
        customersGrowth: calcGrowth(customersNow, customersLast),
        totalBookings: totalBookingsNow,
        bookingsGrowth: calcGrowth(totalBookingsNow, totalBookingsLast),
    };
    return res.status(200).json({
        success: true,
        message: 'Admin dashboard summary (monthly) fetched successfully',
        data: summary,
    });
});
exports.getMonthlyEarnings = (0, catchAsync_1.default)(async (req, res) => {
    const year = Number(req.query.year) || new Date().getFullYear(); // optional query param to filter by year
    const earnings = await payment_1.default.aggregate([
        // Only include paid payments
        { $match: { status: 'paid' } },
        // Filter by year
        {
            $addFields: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
            },
        },
        { $match: { year: year } },
        // Group by month and sum amounts
        {
            $group: {
                _id: '$month',
                totalEarnings: { $sum: '$amount' },
            },
        },
        // Sort by month
        { $sort: { _id: 1 } },
    ]);
    // Format result to be more readable
    const formattedEarnings = Array.from({ length: 12 }, (_, i) => {
        const monthData = earnings.find((e) => e._id === i + 1);
        return {
            month: i + 1,
            totalEarnings: monthData ? monthData.totalEarnings : 0,
        };
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Monthly earnings fetched successfully',
        data: formattedEarnings,
    });
});
const dashboardSummeryController = {
    getAdminDashboardSummery,
};
exports.default = dashboardSummeryController;
