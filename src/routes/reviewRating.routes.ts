import { Router } from "express";
import {
  createReview,
  getAllReviews,
  getReviewsByFacility,
  updateReview,
  deleteReview,
  reviewRatingDashboard,
} from "../controllers/reviewRating.controller";

const router = Router();

router.post("/", createReview);
router.get("/", getAllReviews);
router.get("/facility/:facilityId", getReviewsByFacility);
router.get("/summary/:facilityId", reviewRatingDashboard);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
export default router;
