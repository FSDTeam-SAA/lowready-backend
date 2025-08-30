import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";
import payment from "../models/payment";
import { Facility } from "../models/facility.model";
import SubscriptionPlan from "../subscription/subscription.model";
import { User } from "../models/user.model";

export const getAllUserPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  // Pagination query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Optional type filter
  const typeFilter = req.query.type ? String(req.query.type).trim().toLowerCase() : null;

  // Build query
  const query: any = { userId };
  if (typeFilter) {
    query.type = typeFilter;
  }

  // 1️⃣ Find payments for this user with pagination
  const [payments, total] = await Promise.all([
    payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId'), // ✅ populate userId
    payment.countDocuments(query),
  ]);

  // 2️⃣ Populate referenceId dynamically based on type
  const populatedPayments = await Promise.all(
    payments.map(async (p) => {
      if (p.type === "booking") {
        const facility = await Facility.findById(p.referenceId);
        return { ...p.toObject(), referenceId: facility };
      } else if (p.type === "subscription") {
        const plan = await SubscriptionPlan.findById(p.referenceId);
        return { ...p.toObject(), referenceId: plan };
      } else {
        return p.toObject();
      }
    })
  );

  // 3️⃣ Send response with pagination meta
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments fetched successfully",
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: populatedPayments,
  });
});







export const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Only booking payments
  const matchQuery = { type: "booking", status: "paid" };

  // Aggregate total admin share per facility
  const aggregationPipeline = [
    { $match: matchQuery },
    {
      $group: {
        _id: "$referenceId",
        totalAdminShare: { $sum: { $multiply: ["$amount", 0.18] } }, // 18% of each booking
      },
    },
    { $sort: { totalAdminShare: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const facilityEarnings = await payment.aggregate(aggregationPipeline);

  // Populate facility info
  const result = await Promise.all(
    facilityEarnings.map(async (f) => {
      const facility = await Facility.findById(f._id);
      return {
        facility,
        totalAdminShare: +f.totalAdminShare.toFixed(2), // round to 2 decimals
      };
    })
  );

  // Count total distinct facilities for pagination
  const totalFacilities = await payment.distinct("referenceId", matchQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin earnings per facility fetched successfully",
    meta: {
      total: totalFacilities.length,
      page,
      limit,
      totalPages: Math.ceil(totalFacilities.length / limit),
    },
    data: result,
  });
});
