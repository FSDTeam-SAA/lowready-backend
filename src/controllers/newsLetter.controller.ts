import catchAsync from '../utils/catchAsync'
import sendResponse from '../utils/sendResponse'
import httpStatus from 'http-status'
import AppError from '../errors/AppError'
import { Newsletter } from '../models/newsLetter.models'
import { sendEmail } from '../utils/sendEmail'

export const subscribeNewsletter = catchAsync(async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email is required')
  }

  const existing = await Newsletter.findOne({ email })
  if (existing) {
    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Already subscribed',
      data: existing,
    })
  }

  const subscriber = await Newsletter.create({ email })
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscribed successfully',
    data: subscriber,
  })
})

export const broadcastNewsletter = catchAsync(async (req, res) => {
  const { subject, html } = req.body

  if (!subject || !html) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Subject and HTML content are required'
    )
  }

  const subscribers = await Newsletter.find()
  const emails = subscribers.map((s) => s.email)

  await Promise.all(emails.map((email) => sendEmail(email, subject, html)))

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email sent to all newsletter subscribers',
    data: {},
  })
})
