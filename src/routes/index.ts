import { Router } from 'express'
import { facilityRouter } from './facility.router'
import userRouters from './user.routes'

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
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
