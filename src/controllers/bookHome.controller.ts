import { Request, Response } from 'express'
import httpStatus from 'http-status'
import catchAsync from '../utils/catchAsync'
import AppError from '../errors/AppError'
import sendResponse from '../utils/sendResponse'
import { BookHome } from '../models/bookHome.model'
import { getPaginationParams, buildMetaPagination } from '../utils/pagination'
import { User } from '../models/user.model'
import { Facility } from '../models/facility.model'
import { createNotification } from '../socket/notification.service'
import mongoose from 'mongoose'
import payment from '../models/payment'

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  try {
    const booking = await BookHome.create(req.body)

    const isFacilityExists = await Facility.findById(booking.facility)
    if (!isFacilityExists) throw new AppError(404, 'Facility not found ')

    if (isFacilityExists.availability === false) {
      throw new AppError(400, 'Facility is not available for booking')
    }

    if (isFacilityExists.status === 'pending') {
      throw new AppError(400, 'Facility is not approved yet')
    }

    if (isFacilityExists.status === 'declined') {
      throw new AppError(400, 'Facility is not active now')
    }

    await Facility.findByIdAndUpdate(booking.facility, {
      $inc: { totalPlacement: 1 },
    })

    // 🔔 Create and send notification to the booking user
    await createNotification({
      to: booking.userId, // assuming booking.userId exists
      message: `Your booking for ${Facility.name} has been confirmed!`,
      type: 'booking',
      id: booking._id as mongoose.Types.ObjectId,
    })

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Booking created successfully',
      data: booking,
    })
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, (error as Error).message)
  }
})

export const getAllBookings = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req.query)

    const [bookings, totalItems] = await Promise.all([
      BookHome.find()
        .skip(skip)
        .limit(limit)
        .populate('facility')
        .populate('userId')
        .sort({ createdAt: -1 }),
      BookHome.countDocuments(),
    ])

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'All bookings fetched successfully',
      data: bookings,
      meta: buildMetaPagination(totalItems, page, limit),
    })
  }
)

export const getBookingsByFacility = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req.query)
    const { facilityId } = req.params

    const [bookings, totalItems] = await Promise.all([
      BookHome.find({ facility: facilityId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('facility')
        .populate('userId'),
      BookHome.countDocuments({ facility: facilityId }),
    ])

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Bookings by facility fetched successfully',
      data: bookings,
      meta: buildMetaPagination(totalItems, page, limit),
    })
  }
)

export const getBookingsByUser = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req.query)
    const { userId } = req.params

    const [bookings, totalItems] = await Promise.all([
      BookHome.find({ userId })
        .skip(skip)
        .limit(limit)
        .populate('facility')
        .populate('userId'),
      BookHome.countDocuments({ userId }),
    ])

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Bookings by user fetched successfully',
      data: bookings,
      meta: buildMetaPagination(totalItems, page, limit),
    })
  }
)

export const getBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const booking = await BookHome.findById(id)
    .populate('facility')
    .populate('userId')

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking fetched successfully',
    data: booking,
  })
})

export const editBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const booking = await BookHome.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  })

  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, 'Booking not found or not updated')
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking updated successfully (partial)',
    data: booking,
  })
})

export const getRecentBookings = catchAsync(
  async (req: Request, res: Response) => {
    // 📌 Get page & limit from query (defaults: page=1, limit=10)
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    // 📌 Total count for pagination metadata
    const total = await BookHome.countDocuments()

    // 📌 Fetch bookings with pagination + populate
    const bookings = await BookHome.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'firstName lastName email  street subscriptionPlan createdAt',
      })
      .populate({
        path: 'facility',
        select: 'name location address',
      })

    // 📌 Add isPaid flag
    const bookingsWithPayment = await Promise.all(
      bookings.map(async (booking) => {
        const isPaid = await payment.exists({
          userId: booking.userId,
          status: 'paid',
        })

        return {
          ...booking.toObject(),
          isPaid: !!isPaid,
        }
      })
    )

    // 📌 Response with pagination metadata
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Recent bookings fetched successfully',
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: bookingsWithPayment,
    })
  }
)

export const getBookingsByOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = getPaginationParams(req.query)
    const { orgId } = req.params // organization (facility owner) ID

    // Step 1: Find all facilities owned by this organization
    const facilities = await Facility.find({ userId: orgId }).select('_id')
    if (!facilities.length) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        'No facilities found for this organization'
      )
    }

    const facilityIds = facilities.map((f) => f._id)

    // Step 2: Find all bookings linked to these facilities
    const [bookings, totalItems] = await Promise.all([
      BookHome.find({ facility: { $in: facilityIds } })
        .skip(skip)
        .limit(limit)
        .populate('facility')
        .populate('userId')
        .sort({ createdAt: -1 }),
      BookHome.countDocuments({ facility: { $in: facilityIds } }),
    ])

    // Step 3: Send response
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Organization bookings fetched successfully',
      data: bookings,
      meta: buildMetaPagination(totalItems, page, limit),
    })
  }
)
