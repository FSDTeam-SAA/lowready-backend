import { Router } from 'express'
import { facilityRouter } from './facility.router'
import userRouters from './user.routes'
import reviewRatingRouter from './reviewRating.routes'
import blogRouter from './blog.router'
import contactUsRouter from './contactUs.router'
import visitBookingRouter from './visitBooking.router'
import bookingRouter from './bookHome.route'
import notificationRouter from './notification.route'
import newsLetterRouter from './newsLetter.route'

const router = Router()

const moduleRoutes = [
  {
    path: '/facility',
    route: facilityRouter,
  },
  {
    path: '/user',
    route: userRouters,
  },
  {
    path: '/review-rating',
    route: reviewRatingRouter,
  },
  {
    path: '/blog',
    route: blogRouter,
  },
  {
    path: '/contactUs',
    route: contactUsRouter,
  },
  {
    path: '/visit-booking',
    route: visitBookingRouter,
  },
  {
    path: '/bookings',
    route: bookingRouter,
  },
  {
    path: '/notifications',
    route: notificationRouter,
  },
  {
    path: '/newsletter',
    route: newsLetterRouter,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
