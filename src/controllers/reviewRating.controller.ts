import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { ReviewRating } from '../models/reviewRating.model'
import catchAsync from '../utils/catchAsync'
import AppError from '../errors/AppError'

/*************************
 * //CREATE A NEW REVIEW *
 *************************/
export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { userId, facility, star, comment } = req.body

  if (!userId || !facility || !star) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Missing required fields')
  }

  const review = await ReviewRating.create({ userId, facility, star, comment })

  res.status(httpStatus.CREATED).json({
    success: true,
    message: 'Review created successfully',
    data: review,
  })
})

/***********************
 * //  GET ALL REVIEWS *
 ***********************/
export const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await ReviewRating.find()
    .populate('userId', 'firstName lastName email')
    .populate('facility', 'name address')

  res.status(httpStatus.OK).json({
    success: true,
    total: reviews.length,
    data: reviews,
  })
})

/***********************************
 * // ✅ GET REVIEWS BY FACILITYID *
 ***********************************/
export const getReviewsByFacility = catchAsync(
  async (req: Request, res: Response) => {
    const { facilityId } = req.params

    const reviews = await ReviewRating.find({ facility: facilityId })
      .populate('userId', 'firstName lastName email')
      .populate('facility', 'name address')

    res.status(httpStatus.OK).json({
      success: true,
      total: reviews.length,
      data: reviews,
    })
  }
)

/********************
 * // UPDATE REVIEW *
 ********************/
export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { star, comment } = req.body

  const updatedReview = await ReviewRating.findByIdAndUpdate(
    id,
    { star, comment },
    { new: true, runValidators: true }
  )

  if (!updatedReview) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found')
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Review updated successfully',
    data: updatedReview,
  })
})

/********************
 * // DELETE REVIEW *
 ********************/
export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params

  const deletedReview = await ReviewRating.findByIdAndDelete(id)

  if (!deletedReview) {
    throw new AppError(httpStatus.NOT_FOUND, 'Review not found')
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Review deleted successfully',
  })
})
