"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editBooking = exports.getBooking = exports.getBookingsByUser = exports.getBookingsByFacility = exports.getAllBookings = exports.createBooking = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const bookHome_model_1 = require("../models/bookHome.model");
const pagination_1 = require("../utils/pagination");
const facility_model_1 = require("../models/facility.model");
const notification_service_1 = require("../socket/notification.service");
exports.createBooking = (0, catchAsync_1.default)(async (req, res) => {
    const booking = await bookHome_model_1.BookHome.create(req.body);
    await facility_model_1.Facility.findByIdAndUpdate(booking.facility, {
        $inc: { totalPlacement: 1 },
    });
    // 🔔 Create and send notification to the booking user
    await (0, notification_service_1.createNotification)({
        to: booking.userId, // assuming booking.userId exists
        message: `Your booking for ${facility_model_1.Facility.name} has been confirmed!`,
        type: 'booking',
        id: booking._id,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Booking created successfully',
        data: booking,
    });
});
exports.getAllBookings = (0, catchAsync_1.default)(async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPaginationParams)(req.query);
    const [bookings, totalItems] = await Promise.all([
        bookHome_model_1.BookHome.find()
            .skip(skip)
            .limit(limit)
            .populate('facility')
            .populate('userId')
            .sort({ createdAt: -1 }),
        bookHome_model_1.BookHome.countDocuments(),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All bookings fetched successfully',
        data: bookings,
        meta: (0, pagination_1.buildMetaPagination)(totalItems, page, limit),
    });
});
exports.getBookingsByFacility = (0, catchAsync_1.default)(async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPaginationParams)(req.query);
    const { facilityId } = req.params;
    const [bookings, totalItems] = await Promise.all([
        bookHome_model_1.BookHome.find({ facility: facilityId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('facility')
            .populate('userId'),
        bookHome_model_1.BookHome.countDocuments({ facility: facilityId }),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bookings by facility fetched successfully',
        data: bookings,
        meta: (0, pagination_1.buildMetaPagination)(totalItems, page, limit),
    });
});
exports.getBookingsByUser = (0, catchAsync_1.default)(async (req, res) => {
    const { page, limit, skip } = (0, pagination_1.getPaginationParams)(req.query);
    const { userId } = req.params;
    const [bookings, totalItems] = await Promise.all([
        bookHome_model_1.BookHome.find({ userId })
            .skip(skip)
            .limit(limit)
            .populate('facility')
            .populate('userId'),
        bookHome_model_1.BookHome.countDocuments({ userId }),
    ]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bookings by user fetched successfully',
        data: bookings,
        meta: (0, pagination_1.buildMetaPagination)(totalItems, page, limit),
    });
});
exports.getBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const booking = await bookHome_model_1.BookHome.findById(id)
        .populate('facility')
        .populate('userId');
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking fetched successfully',
        data: booking,
    });
});
exports.editBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const booking = await bookHome_model_1.BookHome.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!booking) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Booking not found or not updated');
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking updated successfully (partial)',
        data: booking,
    });
});
