"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRatingDashboard = exports.deleteReview = exports.updateReview = exports.getReviewsByFacility = exports.getAllReviews = exports.createReview = void 0;
const http_status_1 = __importDefault(require("http-status"));
const reviewRating_model_1 = require("../models/reviewRating.model");
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const sendResponse_1 = __importDefault(require("../utils/sendResponse"));
const mongoose_1 = __importDefault(require("mongoose"));
const facility_model_1 = require("../models/facility.model");
exports.createReview = (0, catchAsync_1.default)(async (req, res) => {
    const { userId, facility, star, comment } = req.body;
    if (!userId || !facility || !star) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Missing required fields");
    }
    // 🔹 Create new review
    const review = await reviewRating_model_1.ReviewRating.create({ userId, facility, star, comment });
    // 🔹 Recalculate stats (avg + count) for that facility
    const stats = await reviewRating_model_1.ReviewRating.aggregate([
        { $match: { facility: new mongoose_1.default.Types.ObjectId(facility) } },
        {
            $group: {
                _id: "$facility",
                avgRating: { $avg: "$star" },
                ratingCount: { $sum: 1 }
            }
        }
    ]);
    let newAvgRating = stats.length > 0 ? stats[0].avgRating : 0;
    let newRatingCount = stats.length > 0 ? stats[0].ratingCount : 0;
    newAvgRating = Number(newAvgRating.toFixed(1));
    // 🔹 Update Facility with both values
    await facility_model_1.Facility.findByIdAndUpdate(facility, {
        rating: newAvgRating,
        ratingCount: newRatingCount
    });
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: "Review created successfully",
        data: {
            review,
            rating: newAvgRating,
            ratingCount: newRatingCount
        }
    });
});
exports.getAllReviews = (0, catchAsync_1.default)(async (req, res) => {
    const reviews = await reviewRating_model_1.ReviewRating.find()
        .populate("userId", "firstName lastName email")
        .populate("facility", "name address");
    res.status(http_status_1.default.OK).json({
        success: true,
        total: reviews.length,
        data: reviews,
    });
});
exports.getReviewsByFacility = (0, catchAsync_1.default)(async (req, res) => {
    const { facilityId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Fetch reviews with pagination
    const reviews = await reviewRating_model_1.ReviewRating.find({ facility: facilityId })
        .populate("userId", "firstName lastName email")
        .populate("facility", "name address")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // newest first
    // Count total reviews for this facility
    const total = await reviewRating_model_1.ReviewRating.countDocuments({ facility: facilityId });
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reviews fetched successfully",
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: reviews,
    });
});
exports.updateReview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const { star, comment } = req.body;
    const updatedReview = await reviewRating_model_1.ReviewRating.findByIdAndUpdate(id, { star, comment }, { new: true, runValidators: true });
    if (!updatedReview) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Review not found");
    }
    // 🔹 Recalculate stats for that facility
    const stats = await reviewRating_model_1.ReviewRating.aggregate([
        { $match: { facility: updatedReview.facility } },
        {
            $group: {
                _id: "$facility",
                avgRating: { $avg: "$star" },
                ratingCount: { $sum: 1 }
            }
        }
    ]);
    let newAvgRating = stats.length > 0 ? stats[0].avgRating : 0;
    let newRatingCount = stats.length > 0 ? stats[0].ratingCount : 0;
    newAvgRating = Number(newAvgRating.toFixed(1));
    // 🔹 Update facility with both rating + ratingCount
    await facility_model_1.Facility.findByIdAndUpdate(updatedReview.facility, {
        rating: newAvgRating,
        ratingCount: newRatingCount
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Review updated successfully",
        data: {
            review: updatedReview,
            rating: newAvgRating,
            ratingCount: newRatingCount
        }
    });
});
exports.deleteReview = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const deletedReview = await reviewRating_model_1.ReviewRating.findByIdAndDelete(id);
    if (!deletedReview) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Review not found");
    }
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Review deleted successfully",
    });
});
exports.reviewRatingDashboard = (0, catchAsync_1.default)(async (req, res) => {
    const { facilityId } = req.params;
    // Aggregate reviews for the specific facility
    const ratingStats = await reviewRating_model_1.ReviewRating.aggregate([
        {
            $match: { facility: new mongoose_1.default.Types.ObjectId(facilityId) }, // filter by facilityId
        },
        {
            $group: {
                _id: "$star",
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: -1 } },
    ]);
    // Always return all 1-5 stars (default 0 if not found)
    const ratingSummary = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    };
    ratingStats.forEach((stat) => {
        ratingSummary[stat._id] = stat.count;
    });
    const total = Object.values(ratingSummary).reduce((a, b) => a + b, 0);
    return (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Review rating dashboard fetched successfully",
        data: {
            total,
            ratings: ratingSummary,
        },
    });
});
