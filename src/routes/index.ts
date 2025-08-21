import { Router } from 'express'
import { facilityRouter } from './facility.router'
import userRouters from './user.routes'
import reviewRatingRouter from './reviewRating.routes'

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
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
