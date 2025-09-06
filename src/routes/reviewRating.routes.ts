import { Router } from 'express'
import {
  createReview,
  getAllReviews,
  getReviewsByFacility,
  updateReview,
  deleteReview,
  reviewRatingDashboard,
  getSingleReview,
  getReviewsByFacilityId,
  getFacilityReviewSummary,
} from '../controllers/reviewRating.controller'
import {
  isAdmin,
  isOrganization,
  protect,
} from '../middlewares/auth.middleware'

const router = Router()

router.post('/', createReview)
router.get('/', getAllReviews)
router.get('/:reviewId', getSingleReview)
router.get('/facility/all', protect, isOrganization, getReviewsByFacility)

router.get(
  '/summary/all-reviews',
  protect,
  isOrganization,
  reviewRatingDashboard
)
router.put('/:id', updateReview)
router.delete('/:id', protect, isOrganization, deleteReview)
router.get('/facility/:facilityId', getReviewsByFacilityId)
router.get('/facility/count/:facilityId', getFacilityReviewSummary)


export default router
