import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewRating } from "../models/reviewRating.model";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import sendResponse from "../utils/sendResponse";
import mongoose from "mongoose";
import { Facility } from "../models/facility.model";


export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { userId, facility, star, comment } = req.body;

  if (!userId || !facility || !star) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  // 🔹 Create new review
  const review = await ReviewRating.create({ userId, facility, star, comment });

  // 🔹 Recalculate stats (avg + count) for that facility
  const stats = await ReviewRating.aggregate([
    { $match: { facility: new mongoose.Types.ObjectId(facility) } },
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
  await Facility.findByIdAndUpdate(facility, {
    rating: newAvgRating,
    ratingCount: newRatingCount
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Review created successfully",
    data: {
      review,
      rating: newAvgRating,
      ratingCount: newRatingCount
    }
  });
});




export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  // Parse query params (default: page=1, limit=10)
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Get total count
  const total = await ReviewRating.countDocuments()

  // Fetch paginated reviews
  const reviews = await ReviewRating.find()
    .populate('userId', 'firstName lastName email')
    .populate('facility', 'name address')
    .skip(skip)
    
    .limit(limit)

  res.status(httpStatus.OK).json({
    success: true,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: reviews,
  })
})


export const getReviewsByFacility = catchAsync(
  async (req: Request, res: Response) => {
    const { facilityId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch reviews with pagination
    const reviews = await ReviewRating.find({ facility: facilityId })
      .populate("userId", "firstName lastName email")
      .populate("facility", "name address")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // newest first

    // Count total reviews for this facility
    const total = await ReviewRating.countDocuments({ facility: facilityId });

    return sendResponse(res, {
      statusCode: httpStatus.OK,
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
  }
);


export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { star, comment } = req.body;

  const updatedReview = await ReviewRating.findByIdAndUpdate(
    id,
    { star, comment },
    { new: true, runValidators: true }
  );

  if (!updatedReview) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // 🔹 Recalculate stats for that facility
  const stats = await ReviewRating.aggregate([
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
  await Facility.findByIdAndUpdate(updatedReview.facility, {
    rating: newAvgRating,
    ratingCount: newRatingCount
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "Review updated successfully",
    data: {
      review: updatedReview,
      rating: newAvgRating,
      ratingCount: newRatingCount
    }
  });
});



export const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedReview = await ReviewRating.findByIdAndDelete(id);

  if (!deletedReview) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: "Review deleted successfully",
  });
});

export const reviewRatingDashboard = catchAsync(async (req, res) => {
  const { facilityId } = req.params;

  // Aggregate reviews for the specific facility
  const ratingStats = await ReviewRating.aggregate([
    {
      $match: { facility: new mongoose.Types.ObjectId(facilityId) }, // filter by facilityId
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
  const ratingSummary: Record<number, number> = {
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

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review rating dashboard fetched successfully",
    data: {
      total,
      ratings: ratingSummary,
    },
  });
});
