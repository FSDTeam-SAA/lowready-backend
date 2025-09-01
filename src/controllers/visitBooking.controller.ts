import mongoose from 'mongoose'
import AppError from '../errors/AppError'
import { Facility } from '../models/facility.model'
import { User } from '../models/user.model'
import { VisitBooking } from '../models/visitBooking.model'
import { createNotification } from '../socket/notification.service'
import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import { IFacility } from '../interface/facility.interface'
import { IUser } from '../interface/user.interface'

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
    } = req.body
    const { _id: userId } = req.user as any

    const user = await User.findById(userId)
    if (!user) throw new AppError(404, 'User not found')

    const isFacilityExists = await Facility.findById(facility);
    if (!isFacilityExists) throw new AppError(404, "Facility not found ");

    if (isFacilityExists.availability === false) {
      throw new AppError(400, 'Facility is not available for booking')
    }

    if (isFacilityExists.status === "pending") {
      throw new AppError(400, "Facility is not approved yet");
    }

    if (isFacilityExists.status === "declined") {
      throw new AppError(400, "Facility is not active now");
    }

    if (
      !isFacilityExists.availableTime ||
      !isFacilityExists.availableTime.includes(visitTime)
    ) {
      throw new AppError(
        400,
        `${visitTime} is not available. Please choose another one.`
      )
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
    })

    // 🔔 Send notification after booking
    await createNotification({
      to: userId,
      message: `Your tour booking for ${isFacilityExists.name} on ${visitDate} at ${visitTime} has been confirmed!`,
      type: 'visitBooking',
      id: new mongoose.Types.ObjectId(visitBooking._id as string),
    })

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Visit booking created successfully',
      data: visitBooking,
    })
  } catch (error: any) {
    throw new AppError(500, error.message)
  }
})



const getMyVisitBookings = catchAsync(async (req, res) => {
  const { _id: userId } = req.user as any

  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found')

  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const [visitBookings, total] = await Promise.all([
    VisitBooking.find({ userId })
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
    VisitBooking.countDocuments({ userId }),
  ])

  return sendResponse(res, {
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
  })
})

const getMyFacilityBookings = catchAsync(async (req, res) => {
  const { _id: userId } = req.user as any

  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found')

  const facility = await Facility.findOne({ userId: userId })
  if (!facility)
    throw new AppError(404, 'No facility found for this organization')

  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  // ✅ Filter by status (support "all")
  const { status } = req.query
  const filter: any = { facility: facility._id }

  if (
    status &&
    status !== 'all' && // 🔥 If "all" → don't filter
    ['upcoming', 'completed', 'cancelled'].includes(status as string)
  ) {
    filter.status = status
  }

  const [result, total] = await Promise.all([
    VisitBooking.find(filter)
      .populate({
        path: 'userId',
        select: 'firstName lastName email phoneNumber',
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    VisitBooking.countDocuments(filter),
  ])

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
  })
})

export const updateVisitBookingStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params

  const visitBooking = await VisitBooking.findById(bookingId)
  if (!visitBooking) throw new AppError(404, 'Visit booking not found')

  const result = await VisitBooking.findByIdAndUpdate(
    bookingId,
    { status: 'completed' },
    { new: true }
  )
    .populate<{ facility: IFacility }>(
      'facility',
      'name location price images userId'
    )
    .populate<{ userId: IUser }>(
      'userId',
      'firstName lastName email phoneNumber'
    )

  if (!result) throw new AppError(404, 'Updated visit booking not found')

  // 🔹 If booking just got completed, increment facility totalTour
  if (result.status === 'completed' && result.facility?._id) {
    await Facility.findByIdAndUpdate(result.facility._id, {
      $inc: { totalTour: 1 },
    })

    /** 🔔 Notifications **/
    // 1. Notify the user
    const user = result.userId as IUser
    const facility = result.facility as IFacility

    await createNotification({
      to: new mongoose.Types.ObjectId(user._id),
      message: `Your visit booking for ${facility.name} has been marked as completed.`,
      type: 'visitBookingCompleted',
      id: new mongoose.Types.ObjectId(result._id as string),
    })

    // 2. Notify the facility owner
    if (facility.userId) {
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || 'A visitor'

      await createNotification({
        to: new mongoose.Types.ObjectId((facility.userId as IUser)._id),
        message: `${userName}'s visit booking at ${facility.name} has been marked as completed.`,
        type: 'visitBookingCompleted',
        id: new mongoose.Types.ObjectId(result._id as string),
      })
    }
  }

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visit booking status updated successfully',
    data: result,
  })
})


const updateCancelVisitBookingStatus = catchAsync(async (req, res) => {
  const { bookingId } = req.params
  const visitBooking = await VisitBooking.findById(bookingId)
  if (!visitBooking) throw new AppError(404, 'Visit booking not found')

  const result = await VisitBooking.findByIdAndUpdate(
    bookingId,
    { status: 'cancelled' },
    { new: true }
  )
    .populate({
      path: 'facility',
      select: 'name location price images',
    })
    .populate({
      path: 'userId',
      select: 'firstName lastName email phoneNumber',
    })

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visit booking status updated successfully',
    data: result,
  })
})


const addFeedback = catchAsync(async (req, res) => {
  const { bookingId } = req.params
  const { feedback, rating } = req.body

  if (!feedback || !rating) {
    throw new AppError(400, 'Feedback and rating are required')
  }

  const visitBooking = await VisitBooking.findById(bookingId)
  if (!visitBooking) throw new AppError(404, 'Visit booking not found')

  const result = await VisitBooking.findByIdAndUpdate(
    bookingId,
    { feedback, rating },
    { new: true }
  )
    .populate({
      path: 'facility',
      select: 'name location price images',
    })
    .populate({
      path: 'userId',
      select: 'firstName lastName email phoneNumber',
    })

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Feedback added successfully',
    data: result,
  })
})

const rescheduleVisitBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params
  const { visitDate, visitTime } = req.body

  const visitBooking = await VisitBooking.findById(bookingId)
  if (!visitBooking) throw new AppError(404, 'Visit booking not found')

  const facility = await Facility.findById(visitBooking.facility)
  if (!facility) throw new AppError(404, 'Facility not found')

  const result = await VisitBooking.findByIdAndUpdate(
    bookingId,
    { visitDate, visitTime },
    { new: true }
  )
    .populate({
      path: 'facility',
      select: 'name location price images',
    })
    .populate({
      path: 'userId',
      select: 'firstName lastName email phoneNumber',
    })

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visit booking rescheduled successfully',
    data: result,
  })
})

const deleteVisitBooking = catchAsync(async (req, res) => {
  const { bookingId } = req.params

  const visitBooking = await VisitBooking.findById(bookingId)
  if (!visitBooking) throw new AppError(404, 'Visit booking not found')

  await VisitBooking.findByIdAndDelete(bookingId)

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Visit booking deleted successfully',
  })
})

const getSingleUserVisitBooking = catchAsync(async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'User not found')

  const result = await VisitBooking.find({ userId: userId })
    .populate({
      path: 'userId',
      select:
        '-password -password_reset_token, -refresh_token -__v  -verificationInfo',
    })
    .populate({
      path: 'facility',
      select: 'name location images',
    })

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your Visit Bookings retrieved successfully',
    data: result,
  })
})

const getAllRecentBookings = catchAsync(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = Number(page);
  limit = Number(limit);

  const skip = (page - 1) * limit;
  const total = await VisitBooking.countDocuments();


  const result = await VisitBooking.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'userId',
      select: 'firstName lastName email street subscriptionPlan createdAt',
    })
    .populate({
      path: 'facility',
      select: 'name location address images',
    });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Your Visit Bookings retrieved successfully',
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  });
});



const visitBookingController = {
  createVisitBooking,
  getMyVisitBookings,
  getMyFacilityBookings,
  updateVisitBookingStatus,
  updateCancelVisitBookingStatus,
  addFeedback,
  rescheduleVisitBooking,
  deleteVisitBooking,
  getSingleUserVisitBooking,
  getAllRecentBookings
}
export default visitBookingController
