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

  // Optional type filter from query
  const typeFilter = req.query.type as string; // "booking" or "subscription" or undefined
  const matchQuery: any = { status: "paid" };
  if (typeFilter) matchQuery.type = { $in: typeFilter.split(",") }; // support multiple types

  // 1️⃣ Fetch filtered payments with population
  const allPayments = await payment
    .find(matchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate([
      { path: "userId", model: User ,strictPopulate: false},                // populate user if exists
      { path: "referenceId", model: Facility ,strictPopulate: false},      // populate facility if exists
      { path: "subscriptionPlan", model: SubscriptionPlan,strictPopulate: false }, // populate subscription plan
    ]);

  // 2️⃣ Separate bookings from other types
  const bookings = allPayments.filter((p) => p.type === "booking");
  const others = allPayments.filter((p) => p.type !== "booking");

  // 3️⃣ Group bookings by facility
  const bookingGroupsMap = new Map<string, any>();
  for (const b of bookings) {
    const facilityId = b.referenceId?._id?.toString() || b.referenceId?.toString();
    if (!bookingGroupsMap.has(facilityId)) {
      bookingGroupsMap.set(facilityId, {
        facility: b.referenceId || null,
        totalAdminShare: 0,
        payments: [],
      });
    }
    const group = bookingGroupsMap.get(facilityId);
    group.totalAdminShare += b.amount * 0.18;
    group.payments.push(b);
  }

  const groupedBookings = Array.from(bookingGroupsMap.values()).map((g) => ({
    facility: g.facility,
    totalAdminShare: +g.totalAdminShare.toFixed(2),
    payments: g.payments,
  }));

  // 4️⃣ Map other payments individually
  const otherResults = others.map((p) => ({
    facility: p.referenceId || null, // if reference exists
    totalAdminShare: 0,
    payments: [p],
  }));

  // 5️⃣ Combine bookings + other payments
  const result = [...groupedBookings, ...otherResults];

  // 6️⃣ Prepare meta
  const totalCount = await payment.countDocuments(matchQuery);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payments fetched successfully",
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
    data: result,
  });
});
