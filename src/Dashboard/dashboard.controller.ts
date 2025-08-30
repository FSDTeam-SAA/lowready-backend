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
  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Optional type filter
  const typeFilter = req.query.type ? String(req.query.type).trim().toLowerCase() : null;

  // Build query
  const query: any = {};
  if (typeFilter) query.type = typeFilter;

  // 1️⃣ Fetch payments with userId populated
  const [payments, total] = await Promise.all([
    payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId'), // populate user
    payment.countDocuments(query),
  ]);

  // 2️⃣ Dynamically populate referenceId based on type
  const populatedPayments = await Promise.all(
    payments.map(async (p) => {
      if (p.type === "booking") {
        const facility = await Facility.findById(p.referenceId).populate('userId'); // nested population if needed
        return { ...p.toObject(), referenceId: facility };
      } else if (p.type === "subscription") {
        const plan = await SubscriptionPlan.findById(p.referenceId).populate('userId'); // nested if needed
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
    message: "All payments fetched successfully",
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: populatedPayments,
  });
});