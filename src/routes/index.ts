import { Router } from 'express'
import { facilityRouter } from './facility.router'
import userRouters from './user.routes'
import reviewRatingRouter from './reviewRating.routes'
import blogRouter from './blog.router'
import contactUsRouter from './contactUs.router'
import visitBookingRouter from './visitBooking.router'
import bookingRouter from './bookHome.route'

import docuementRouter from './document.routes'
import documentRouter from './document.routes'
import accountRoutes from './account.routes'

import notificationRouter from './notification.route'
import newsLetterRouter from './newsLetter.route'
import dashboardSummeryRouter from './dashboardSummery.router'
import subscription from '../subscription/subscription.routes'
import payment from '../Payment/payment.routes'



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
    path: '/document',
    route: documentRouter,
  },
  {
    path: '/account',
    route: accountRoutes,
  },

  {
    path: '/notifications',
    route: notificationRouter,
  },
  {
    path: '/newsletter',
    route: newsLetterRouter,
  },
  {
    path: "/dashboard",
    route: dashboardSummeryRouter
  },
    {
    path: '/subscription',
    route: subscription,
  },
    {
    path: '/payment',
    route: payment,
  },
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
