import AppError from "../errors/AppError";
import { Facility } from "../models/facility.model";
import { User } from "../models/user.model";
import { VisitBooking } from "../models/visitBooking.model";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";

const createVisitBooking = catchAsync(async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      relationWith,
      message,
      facility,
      visitDate,
      visitTime,
    } = req.body;
    const { _id: userId } = req.user as any;
    const user = await User.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const isFacilityExists = await Facility.findById(facility);
    if (!isFacilityExists) throw new AppError(404, "Facility not found ");

    if (!facility.availability === false) {
      throw new AppError(400, "Facility is not available for booking");
    }

    if (
      !isFacilityExists.availableTime ||
      !isFacilityExists.availableTime.includes(visitTime)
    ) {
      throw new AppError(
        400,
        `${visitTime} is not available. Please choose another one.`
      );
    }

    const visitBooking = await VisitBooking.create({
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

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Visit booking created successfully",
      data: visitBooking,
    });
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
});

const getMyVisitBookings = catchAsync(async (req, res) => {
  const { _id: userId } = req.user as any;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [visitBookings, total] = await Promise.all([
    VisitBooking.find({ userId })
      .populate({
        path: "facility",
        select: "name location price images",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    VisitBooking.countDocuments({ userId }),
  ]);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Visit Bookings retrieved successfully",
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

const getMyFacilityBookings = catchAsync(async (req, res) => {
  const { _id: userId } = req.user as any;

  const user = await User.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  const facility = await Facility.findOne({ userId: userId });
  if (!facility)
    throw new AppError(404, "No facility found for this organization");

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [result, total] = await Promise.all([
    VisitBooking.find({ facility: facility._id })
      .populate({
        path: "facility",
        select: "name location price images",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email phoneNumber",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    VisitBooking.countDocuments({ facility: facility._id }),
  ]);

  return sendResponse(res, {
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

const updateVisitBookingStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  const visitBooking = await VisitBooking.findById(bookingId);
  if (!visitBooking) throw new AppError(404, "Visit booking not found");

  const validStatuses = ["upcoming", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new AppError(400, "Invalid status value");
  }

  const result = await VisitBooking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true }
  )
    .populate({
      path: "facility",
      select: "name location price images",
    })
    .populate({
      path: "userId",
      select: "firstName lastName email phoneNumber",
    });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Visit booking status updated successfully",
    data: result,
  });
});

const visitBookingController = {
  createVisitBooking,
  getMyVisitBookings,
  getMyFacilityBookings,
  updateVisitBookingStatus,
};
export default visitBookingController;
