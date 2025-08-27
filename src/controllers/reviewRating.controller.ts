import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewRating } from "../models/reviewRating.model";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/AppError";
import sendResponse from "../utils/sendResponse";
import mongoose from "mongoose";

/*************************
 * //CREATE A NEW REVIEW *
 *************************/
export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { userId, facility, star, comment } = req.body;

  if (!userId || !facility || !star) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  const review = await ReviewRating.create({ userId, facility, star, comment });

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Review created successfully",
    data: review,
  });
});

/***********************
 * //  GET ALL REVIEWS *
 ***********************/
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await ReviewRating.find()
    .populate("userId", "firstName lastName email")
    .populate("facility", "name address");

  res.status(httpStatus.OK).json({
    success: true,
    total: reviews.length,
    data: reviews,
  });
});

/***********************************
 * // ✅ GET REVIEWS BY FACILITYID *
 ***********************************/
export const getReviewsByFacility = catchAsync(
  async (req: Request, res: Response) => {
    const { facilityId } = req.params;

    const reviews = await ReviewRating.find({ facility: facilityId })
      .populate("userId", "firstName lastName email")
      .populate("facility", "name address");

    res.status(httpStatus.OK).json({
      success: true,
      total: reviews.length,
      data: reviews,
    });
  }
);

/********************
 * // UPDATE REVIEW *
 ********************/
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

  res.status(httpStatus.OK).json({
    success: true,
    message: "Review updated successfully",
    data: updatedReview,
  });
});

/********************
 * // DELETE REVIEW *
 ********************/
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
