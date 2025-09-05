import { Router } from 'express'
import dashboardSummeryController, {
  getMonthlyEarnings,
} from '../controllers/dashboardSummery'
import { isOrganization, protect } from '../middlewares/auth.middleware'

const router = Router()

router.get(
  '/admin-dashboard',
  dashboardSummeryController.getAdminDashboardSummery
)
router.get('/admin-dashboard/total/earnings', getMonthlyEarnings)

// organization dashboard statistic data
router.get(
  '/org-dashboard',
  protect,
  isOrganization,
  dashboardSummeryController.getOrgDashboardStaticData
)

router.get(
  '/org-dashboard/total/earnings',
  protect,
  isOrganization,
  dashboardSummeryController.getOrgMonthlyfororgEarnings
)

const dashboardSummeryRouter = router
export default dashboardSummeryRouter
