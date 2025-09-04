import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingsByFacility,
  getBookingsByUser,
  getBooking,
  editBooking,
  getRecentBookings,
  deleteBooking,
} from "../controllers/bookHome.controller";

import { protect, isAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, isAdmin, getAllBookings);
router.get("/recent-home-bookings", getRecentBookings);
router.get("/facility/:facilityId", protect, getBookingsByFacility);
router.get("/user/:userId", protect, getBookingsByUser);
router.get("/:id", protect, getBooking);
router.patch("/:id", protect, editBooking);
router.delete("/:id", deleteBooking);

export default router;
