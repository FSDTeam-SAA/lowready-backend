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
import {
  isAdmin,
  isOrganization,
  protect,
} from "../middlewares/auth.middleware";

const router = Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/:reviewId", getSingleReview);
router.get("/facility/all", protect, isOrganization, getReviewsByFacility);

router.get(
  "/summary/all-reviews",
  protect,
  isOrganization,
  reviewRatingDashboard
);
router.put("/:id", updateReview);
router.delete("/:id", protect, isOrganization, deleteReview);

export default router;
