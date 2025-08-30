import { Router } from 'express'
import dashboardSummeryController, {
  getMonthlyEarnings,
} from '../controllers/dashboardSummery'

const router = Router()

router.get(
  '/admin-dashboard',
  dashboardSummeryController.getAdminDashboardSummery
)
router.get('/admin-dashboard/total/earnings', getMonthlyEarnings)

const dashboardSummeryRouter = router
export default dashboardSummeryRouter
