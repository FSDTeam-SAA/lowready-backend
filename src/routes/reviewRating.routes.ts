import { Router } from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByFacility,
  updateReview,
  deleteReview,
  reviewRatingDashboard,
  getSingleReview,
} from "../controllers/reviewRating.controller";
import { isAdmin, protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/:reviewId", getSingleReview)
router.get("/facility/:facilityId", getReviewsByFacility);
router.get("/summary/:facilityId", reviewRatingDashboard);
router.put("/:id", updateReview);
router.delete("/:id", protect, isAdmin, deleteReview);
export default router;
