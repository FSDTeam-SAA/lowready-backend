"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVisitBookingStatus = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const facility_model_1 = require("../models/facility.model");
const user_model_1 = require("../models/user.model");
const visitBooking_model_1 = require("../models/visitBooking.model");
const notification_service_1 = require("../socket/notification.service");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
// const createVisitBooking = catchAsync(async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phoneNumber,
//       relationWith,
//       message,
//       facility,
//       visitDate,
//       visitTime,
//     } = req.body
//     const { _id: userId } = req.user as any
//     const user = await User.findById(userId)
//     if (!user) throw new AppError(404, 'User not found')
//     const isFacilityExists = await Facility.findById(facility)
//     if (!isFacilityExists) throw new AppError(404, 'Facility not found')
//     if (isFacilityExists.availability === false) {
//       throw new AppError(400, 'Facility is not available for booking')
//     }
//     if (
//       !isFacilityExists.availableTime ||
//       !isFacilityExists.availableTime.includes(visitTime)
//     ) {
//       throw new AppError(
//         400,
//         `${visitTime} is not available. Please choose another one.`
//       )
//     }
//     const visitBooking = await VisitBooking.create({
//       userId,
//       name,
//       email,
//       phoneNumber,
//       relationWith,
//       message,
//       facility,
//       visitDate,
//       visitTime,
//     })
//     // 🔔 Send notification after booking
//     await createNotification({
//       to: userId,
//       message: `Your tour booking for ${isFacilityExists.name} on ${visitDate} at ${visitTime} has been confirmed!`,
//       type: 'visitBooking',
//       id: new mongoose.Types.ObjectId(visitBooking._id),
//     })
//     return sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'Visit booking created successfully',
//       data: visitBooking,
//     })
//   } catch (error: any) {
//     throw new AppError(500, error.message)
//   }
// })
const createVisitBooking = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { name, email, phoneNumber, relationWith, message, facility, visitDate, visitTime, } = req.body;
        const { _id: userId } = req.user;
        const user = await user_model_1.User.findById(userId);
        if (!user)
            throw new AppError_1.default(404, 'User not found');
        const isFacilityExists = await facility_model_1.Facility.findById(facility);
        if (!isFacilityExists)
            throw new AppError_1.default(404, 'Facility not found');
        if (isFacilityExists.availability === false) {
            throw new AppError_1.default(400, 'Facility is not available for booking');
        }
        if (!isFacilityExists.availableTime ||
            !isFacilityExists.availableTime.includes(visitTime)) {
            throw new AppError_1.default(400, `${visitTime} is not available. Please choose another one.`);
        }
        const visitBooking = await visitBooking_model_1.VisitBooking.create({
            userId,
            name,
            email,
            phoneNumber,
            relationWith,
            message,
            facility,
            visitDate,
            visitTime,
        });
        // Increment total tours booked
        await facility_model_1.Facility.findByIdAndUpdate(facility, { $inc: { totalTour: 1 } });
        /** 🔔 Notifications **/
        // 1. Notify the booking user
        await (0, notification_service_1.createNotification)({
            to: userId,
            message: `Your tour booking for ${isFacilityExists.name} on ${visitDate} at ${visitTime} has been confirmed.`,
            type: 'visitBooking',
            id: new mongoose_1.default.Types.ObjectId(visitBooking._id),
        });
        // 2. Notify the facility owner/admin
        if (isFacilityExists.userId &&
            typeof isFacilityExists.userId === 'string') {
            await (0, notification_service_1.createNotification)({
                to: new mongoose_1.default.Types.ObjectId(isFacilityExists.userId),
                message: `${user.firstName || 'A visitor'} booked a tour at your facility (${isFacilityExists.name}) on ${visitDate} at ${visitTime}. Message: "${message}"`,
                type: 'visitBooking',
                id: new mongoose_1.default.Types.ObjectId(visitBooking._id),
            });
        }
        return (0, sendResponse_1.default)(res, {
            statusCode: 200,
            success: true,
            message: 'Visit booking created successfully',
            data: visitBooking,
        });
    }
    catch (error) {
        throw new AppError_1.default(500, error.message);
    }
});
const getMyVisitBookings = (0, catchAsync_1.default)(async (req, res) => {
    const { _id: userId } = req.user;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [visitBookings, total] = await Promise.all([
        visitBooking_model_1.VisitBooking.find({ userId })
            .populate({
            path: 'facility',
            select: 'name location price images',
        })
            .populate({
            path: 'userId',
            select: 'firstName lastName email phoneNumber',
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        visitBooking_model_1.VisitBooking.countDocuments({ userId }),
    ]);
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visit Bookings retrieved successfully',
        data: {
            bookings: visitBookings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        },
    });
});
const getMyFacilityBookings = (0, catchAsync_1.default)(async (req, res) => {
    const { _id: userId } = req.user;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    const facility = await facility_model_1.Facility.findOne({ userId: userId });
    if (!facility)
        throw new AppError_1.default(404, 'No facility found for this organization');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // ✅ Filter by status (support "all")
    const { status } = req.query;
    const filter = { facility: facility._id };
    if (status &&
        status !== 'all' && // 🔥 If "all" → don't filter
        ['upcoming', 'completed', 'cancelled'].includes(status)) {
        filter.status = status;
    }
    const [result, total] = await Promise.all([
        visitBooking_model_1.VisitBooking.find(filter)
            .populate({
            path: 'userId',
            select: 'firstName lastName email phoneNumber',
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }),
        visitBooking_model_1.VisitBooking.countDocuments(filter),
    ]);
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Your Facility's Visit Bookings retrieved successfully",
        data: {
            bookings: result,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        },
    });
});
exports.updateVisitBookingStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const visitBooking = await visitBooking_model_1.VisitBooking.findById(bookingId);
    if (!visitBooking)
        throw new AppError_1.default(404, 'Visit booking not found');
    const result = await visitBooking_model_1.VisitBooking.findByIdAndUpdate(bookingId, { status: 'completed' }, { new: true })
        .populate('facility', 'name location price images userId')
        .populate('userId', 'firstName lastName email phoneNumber');
    if (!result)
        throw new AppError_1.default(404, 'Updated visit booking not found');
    // 🔹 If booking just got completed, increment facility totalTour
    if (result.status === 'completed' && result.facility?._id) {
        await facility_model_1.Facility.findByIdAndUpdate(result.facility._id, {
            $inc: { totalTour: 1 },
        });
        /** 🔔 Notifications **/
        // 1. Notify the user
        const user = result.userId;
        const facility = result.facility;
        await (0, notification_service_1.createNotification)({
            to: new mongoose_1.default.Types.ObjectId(user._id),
            message: `Your visit booking for ${facility.name} has been marked as completed.`,
            type: 'visitBookingCompleted',
            id: new mongoose_1.default.Types.ObjectId(result._id),
        });
        // 2. Notify the facility owner
        if (facility.userId) {
            const userName = user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || 'A visitor';
            await (0, notification_service_1.createNotification)({
                to: new mongoose_1.default.Types.ObjectId(facility.userId._id),
                message: `${userName}'s visit booking at ${facility.name} has been marked as completed.`,
                type: 'visitBookingCompleted',
                id: new mongoose_1.default.Types.ObjectId(result._id),
            });
        }
    }
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visit booking status updated successfully',
        data: result,
    });
});
// const updateVisitBookingStatus = catchAsync(async (req, res) => {
//   const { bookingId } = req.params
//   const visitBooking = await VisitBooking.findById(bookingId)
//   if (!visitBooking) throw new AppError(404, 'Visit booking not found')
//   const result = await VisitBooking.findByIdAndUpdate(
//     bookingId,
//     { status: 'completed' },
//     { new: true }
//   )
//     .populate({
//       path: 'facility',
//       select: 'name location price images',
//     })
//     .populate({
//       path: 'userId',
//       select: 'firstName lastName email phoneNumber',
//     })
//   // 🔹 If booking just got completed, increment user’s totalTour
//   if (result?.status === 'completed') {
//     await Facility.findByIdAndUpdate(result.facility, {
//       $inc: { totalTour: 1 },
//     })
//   }
//   return sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Visit booking status updated successfully',
//     data: result,
//   })
// })
// const updateVisitBookingStatus = catchAsync(async (req, res) => {
//   const { bookingId } = req.params
//   const visitBooking = await VisitBooking.findById(bookingId)
//   if (!visitBooking) throw new AppError(404, 'Visit booking not found')
//   const result = await VisitBooking.findByIdAndUpdate(
//     bookingId,
//     { status: 'completed' },
//     { new: true }
//   )
//     .populate({
//       path: 'facility',
//       select: 'name location price images userId',
//     })
//     .populate({
//       path: 'userId',
//       select: 'firstName lastName email phoneNumber',
//     })
//   // 🔹 If booking just got completed, increment facility totalTour
//   if (result?.status === 'completed' && result.facility?._id) {
//     await Facility.findByIdAndUpdate(result.facility._id, {
//       $inc: { totalTour: 1 },
//     })
//     /** 🔔 Notifications **/
//     // 1. Notify the user
//     await createNotification({
//       to: result.userId._id,
//       message: `Your visit booking for ${result.facility as any} has been marked as completed.`,
//       type: 'visitBookingCompleted',
//       id: new mongoose.Types.ObjectId(visitBooking._id),
//     })
//     // 2. Notify the facility owner
//     // @ts-ignore
//     if (result.facility.userId) {
//       const userName =
//         result.userId.firstName && result.userId.lastName
//           ? `${result.userId.firstName} ${result.userId.lastName}`
//           : result.userId.firstName || 'A visitor'
//       await createNotification({
//         to: result.facility.userId,
//         message: `${userName}'s visit booking at ${result.facility.name} has been marked as completed.`,
//         type: 'visitBookingCompleted',
//         id: result._id,
//       })
//     }
//   }
//   return sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Visit booking status updated successfully',
//     data: result,
//   })
// })
const updateCancelVisitBookingStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const visitBooking = await visitBooking_model_1.VisitBooking.findById(bookingId);
    if (!visitBooking)
        throw new AppError_1.default(404, 'Visit booking not found');
    const result = await visitBooking_model_1.VisitBooking.findByIdAndUpdate(bookingId, { status: 'cancelled' }, { new: true })
        .populate({
        path: 'facility',
        select: 'name location price images',
    })
        .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber',
    });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visit booking status updated successfully',
        data: result,
    });
});
const addFeedback = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const { feedback, rating } = req.body;
    if (!feedback || !rating) {
        throw new AppError_1.default(400, 'Feedback and rating are required');
    }
    const visitBooking = await visitBooking_model_1.VisitBooking.findById(bookingId);
    if (!visitBooking)
        throw new AppError_1.default(404, 'Visit booking not found');
    const result = await visitBooking_model_1.VisitBooking.findByIdAndUpdate(bookingId, { feedback, rating }, { new: true })
        .populate({
        path: 'facility',
        select: 'name location price images',
    })
        .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber',
    });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Feedback added successfully',
        data: result,
    });
});
const rescheduleVisitBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const { visitDate, visitTime } = req.body;
    const visitBooking = await visitBooking_model_1.VisitBooking.findById(bookingId);
    if (!visitBooking)
        throw new AppError_1.default(404, 'Visit booking not found');
    const facility = await facility_model_1.Facility.findById(visitBooking.facility);
    if (!facility)
        throw new AppError_1.default(404, 'Facility not found');
    const result = await visitBooking_model_1.VisitBooking.findByIdAndUpdate(bookingId, { visitDate, visitTime }, { new: true })
        .populate({
        path: 'facility',
        select: 'name location price images',
    })
        .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber',
    });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visit booking rescheduled successfully',
        data: result,
    });
});
const deleteVisitBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { bookingId } = req.params;
    const visitBooking = await visitBooking_model_1.VisitBooking.findById(bookingId);
    if (!visitBooking)
        throw new AppError_1.default(404, 'Visit booking not found');
    await visitBooking_model_1.VisitBooking.findByIdAndDelete(bookingId);
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Visit booking deleted successfully',
    });
});
const getSingleUserVisitBooking = (0, catchAsync_1.default)(async (req, res) => {
    const { userId } = req.params;
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(404, 'User not found');
    const result = await visitBooking_model_1.VisitBooking.find({ userId: userId })
        .populate({
        path: 'userId',
        select: '-password -password_reset_token, -refresh_token -__v  -verificationInfo',
    })
        .populate({
        path: 'facility',
        select: 'name location images',
    });
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Your Visit Bookings retrieved successfully',
        data: result,
    });
});
const visitBookingController = {
    createVisitBooking,
    getMyVisitBookings,
    getMyFacilityBookings,
    updateVisitBookingStatus: exports.updateVisitBookingStatus,
    updateCancelVisitBookingStatus,
    addFeedback,
    rescheduleVisitBooking,
    deleteVisitBooking,
    getSingleUserVisitBooking,
};
exports.default = visitBookingController;
