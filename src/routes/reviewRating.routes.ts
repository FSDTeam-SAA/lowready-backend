import { Router } from 'express'
import {
  createReview,
  getAllReviews,
  getReviewsByFacility,
  updateReview,
  deleteReview,
} from '../controllers/reviewRating.controller'

const router = Router()

router.post('/', createReview) 
router.get('/', getAllReviews) 
router.get('/facility/:facilityId', getReviewsByFacility) 
router.put('/:id', updateReview) 
router.delete('/:id', deleteReview)
export default router
